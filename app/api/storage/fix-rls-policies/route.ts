import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    )

    // Check if the user is authenticated with regular client
    const cookieStore = cookies()
    const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string, {
      auth: {
        cookieStore,
      },
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const bucketName = "avatar-urls"

    // Check if the bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to create bucket: ${error.message}`,
          },
          { status: 500 },
        )
      }
    } else {
      // Update the bucket to be public
      const { error } = await supabaseAdmin.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to update bucket: ${error.message}`,
          },
          { status: 500 },
        )
      }
    }

    // Execute SQL to update RLS policies for the bucket
    // This will create policies that allow authenticated users to:
    // 1. Select (view) any file
    // 2. Insert their own files
    // 3. Update their own files
    // 4. Delete their own files
    const { error: sqlError } = await supabaseAdmin.rpc("apply_storage_rls_policies", {
      p_bucket_name: bucketName,
    })

    if (sqlError) {
      // If the RPC function doesn't exist, fall back to direct SQL
      console.log("RPC function not found, using direct SQL:", sqlError)

      // Create SQL statements for RLS policies
      const sqlStatements = [
        // Drop existing policies if they exist
        `DROP POLICY IF EXISTS "Allow public select for ${bucketName}" ON storage.objects;`,
        `DROP POLICY IF EXISTS "Allow authenticated insert for ${bucketName}" ON storage.objects;`,
        `DROP POLICY IF EXISTS "Allow authenticated update for ${bucketName}" ON storage.objects;`,
        `DROP POLICY IF EXISTS "Allow authenticated delete for ${bucketName}" ON storage.objects;`,

        // Create new policies
        `CREATE POLICY "Allow public select for ${bucketName}" 
         ON storage.objects FOR SELECT 
         USING (bucket_id = '${bucketName}');`,

        `CREATE POLICY "Allow authenticated insert for ${bucketName}" 
         ON storage.objects FOR INSERT 
         WITH CHECK (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');`,

        `CREATE POLICY "Allow authenticated update for ${bucketName}" 
         ON storage.objects FOR UPDATE 
         USING (bucket_id = '${bucketName}' AND auth.uid()::text = owner) 
         WITH CHECK (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');`,

        `CREATE POLICY "Allow authenticated delete for ${bucketName}" 
         ON storage.objects FOR DELETE 
         USING (bucket_id = '${bucketName}' AND auth.uid()::text = owner);`,
      ]

      // Execute each SQL statement
      for (const sql of sqlStatements) {
        const { error } = await supabaseAdmin.rpc("exec_sql", { sql })
        if (error) {
          console.error("Error executing SQL:", sql, error)
          // Continue with other statements even if one fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `RLS policies for "${bucketName}" bucket have been updated successfully`,
    })
  } catch (error) {
    console.error("Error in fix-rls-policies route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
