-- Add question_ranking_order column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS question_ranking_order INTEGER[] DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN profiles.question_ranking_order IS 'Ordered array of question IDs from most important to least important';
