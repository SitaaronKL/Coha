-- First, drop the existing exec_sql function
DROP FUNCTION IF EXISTS public.exec_sql(text);

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

-- Grant execute permission on this function to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
