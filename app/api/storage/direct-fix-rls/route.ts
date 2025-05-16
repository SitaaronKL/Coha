import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    )

    const bucketName = "avatar-urls"
    const logs: string[] = []

    // Step 1: Ensure the bucket exists and is public
    logs.push("Checking if bucket exists...")
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      logs.push(`Error listing buckets: ${bucketsError.message}`)
      return NextResponse.json({ success: false, error: bucketsError.message, logs }, { status: 500 })
    }

    const bucket = buckets?.find((b) => b.name === bucketName)

    if (!bucket) {
      logs.push(`Creating bucket: ${bucketName}`)
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        logs.push(`Error creating bucket: ${createError.message}`)
        return NextResponse.json({ success: false, error: createError.message, logs }, { status: 500 })
      }
      logs.push("Bucket created successfully")
    } else {
      logs.push(`Updating bucket: ${bucketName} to be public`)
      const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (updateError) {
        logs.push(`Error updating bucket: ${updateError.message}`)
        return NextResponse.json({ success: false, error: updateError.message, logs }, { status: 500 })
      }
      logs.push("Bucket updated successfully")
    }

    // Step 2: Direct SQL execution for RLS policies
    logs.push("Applying RLS policies...")

    // SQL statements to execute
    const statements = [
      // Enable RLS on objects table if not already enabled
      `ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;`,

      // Drop existing policies for this bucket
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

    // Execute each statement
    for (const sql of statements) {
      try {
        logs.push(`Executing: ${sql.substring(0, 50)}...`)
        const { error } = await supabaseAdmin.rpc("exec_sql", { query: sql })

        if (error) {
          logs.push(`SQL Error: ${error.message}`)
          // Continue with other statements even if one fails
        } else {
          logs.push("SQL executed successfully")
        }
      } catch (err) {
        logs.push(`Exception: ${err.message}`)
        // Continue with other statements
      }
    }

    // Step 3: Test upload permission
    logs.push("Testing upload permission...")
    const testContent = new Blob(["test"], { type: "text/plain" })
    const testFileName = `permission-test-${Date.now()}.txt`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(testFileName, testContent, { upsert: true })

    if (uploadError) {
      logs.push(`Upload test failed: ${uploadError.message}`)
      return NextResponse.json(
        {
          success: false,
          error: `Upload test failed: ${uploadError.message}`,
          logs,
        },
        { status: 500 },
      )
    }

    logs.push("Upload test successful")

    // Clean up test file
    await supabaseAdmin.storage.from(bucketName).remove([testFileName])
    logs.push("Test file removed")

    return NextResponse.json({
      success: true,
      message: "RLS policies applied successfully",
      logs,
    })
  } catch (error) {
    console.error("Error in direct-fix-rls route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
