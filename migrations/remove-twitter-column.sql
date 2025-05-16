-- Migration to remove the twitter column from profiles table

-- First check if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'twitter'
  ) THEN
    -- Remove the twitter column
    ALTER TABLE profiles DROP COLUMN twitter;
  END IF;
END $$;
