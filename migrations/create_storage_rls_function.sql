-- Create a function to apply RLS policies to a storage bucket
CREATE OR REPLACE FUNCTION public.apply_storage_rls_policies(p_bucket_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policies if they exist
  EXECUTE format('DROP POLICY IF EXISTS "Allow public select for %I" ON storage.objects', p_bucket_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated insert for %I" ON storage.objects', p_bucket_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated update for %I" ON storage.objects', p_bucket_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated delete for %I" ON storage.objects', p_bucket_name);
  
  -- Create new policies
  -- Allow anyone to read/view files
  EXECUTE format('
    CREATE POLICY "Allow public select for %I" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = ''%I'')
  ', p_bucket_name, p_bucket_name);
  
  -- Allow authenticated users to upload files
  EXECUTE format('
    CREATE POLICY "Allow authenticated insert for %I" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = ''%I'' AND auth.role() = ''authenticated'')
  ', p_bucket_name, p_bucket_name);
  
  -- Allow users to update their own files
  EXECUTE format('
    CREATE POLICY "Allow authenticated update for %I" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = ''%I'' AND auth.uid()::text = owner) 
    WITH CHECK (bucket_id = ''%I'' AND auth.role() = ''authenticated'')
  ', p_bucket_name, p_bucket_name, p_bucket_name);
  
  -- Allow users to delete their own files
  EXECUTE format('
    CREATE POLICY "Allow authenticated delete for %I" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = ''%I'' AND auth.uid()::text = owner)
  ', p_bucket_name, p_bucket_name);
END;
$$;

-- Create a function to execute arbitrary SQL (for admin use only)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant execute permission on these functions to authenticated users
GRANT EXECUTE ON FUNCTION public.apply_storage_rls_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
