-- Add the missing columns to the user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS social_room_preference TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS eating_in_room TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS mbti_personality TEXT;

-- Add comments to columns for better documentation
COMMENT ON COLUMN user_preferences.social_room_preference IS 'Extrovert, Happy balance, Introvert';
COMMENT ON COLUMN user_preferences.eating_in_room IS 'Absolutely never, Occasional snack, Frequently';
COMMENT ON COLUMN user_preferences.mbti_personality IS 'Myers-Briggs Type Indicator (e.g., INTJ, ENFP)';
