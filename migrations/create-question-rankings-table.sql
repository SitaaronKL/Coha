-- Create a table to store user question rankings
CREATE TABLE IF NOT EXISTS question_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  rank_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Add RLS policies
ALTER TABLE question_rankings ENABLE ROW LEVEL SECURITY;

-- Users can view their own rankings
CREATE POLICY "Users can view their own question rankings"
ON question_rankings FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own rankings
CREATE POLICY "Users can insert their own question rankings"
ON question_rankings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own rankings
CREATE POLICY "Users can update their own question rankings"
ON question_rankings FOR UPDATE
USING (auth.uid() = user_id);
