-- Check if matches table exists, create if it doesn't
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score FLOAT NOT NULL DEFAULT 0,
  matching_tags TEXT,
  matching_traits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_user_id ON matches(matched_user_id);

-- Create foreign key relationship for Supabase RLS policies
ALTER TABLE matches DROP CONSTRAINT IF EXISTS fk_matches_profiles_user;
ALTER TABLE matches ADD CONSTRAINT fk_matches_profiles_user 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE matches DROP CONSTRAINT IF EXISTS fk_matches_profiles_matched;
ALTER TABLE matches ADD CONSTRAINT fk_matches_profiles_matched 
  FOREIGN KEY (matched_user_id) REFERENCES profiles(id) ON DELETE CASCADE;
