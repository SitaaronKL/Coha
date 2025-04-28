-- Check the current schema of user_preferences table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences';

-- Add any missing columns needed for the 8 questions
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS sleep_schedule TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS social_room_preference TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS overnight_guests TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS sharing_comfort TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS cleanliness TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS temperature_preference TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS eating_in_room TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS noise_tolerance TEXT;

-- Add the MBTI personality trait column
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS mbti_personality TEXT;

-- Add comments to columns for better documentation
COMMENT ON COLUMN user_preferences.sleep_schedule IS 'Early Bird (10-8), Night Owl (Past 12-10), Unpredictable';
COMMENT ON COLUMN user_preferences.social_room_preference IS 'Extrovert, Happy balance, Introvert';
COMMENT ON COLUMN user_preferences.overnight_guests IS 'Sure I don''t mind, I''d prefer not at all, If I''m not there';
COMMENT ON COLUMN user_preferences.sharing_comfort IS 'Of course!, Clothing but not food, Food but not clothing, I prefer not to share supplies';
COMMENT ON COLUMN user_preferences.cleanliness IS 'Spotless, Don''t mind some mess';
COMMENT ON COLUMN user_preferences.temperature_preference IS 'North pole (below 66), Average (68-72), Warm (74+)';
COMMENT ON COLUMN user_preferences.eating_in_room IS 'Absolutely never, Occasional snack, Frequently';
COMMENT ON COLUMN user_preferences.noise_tolerance IS 'Quiet environment, Loud during day but quiet at night, Party/loud music';
COMMENT ON COLUMN user_preferences.mbti_personality IS 'Myers-Briggs Type Indicator (e.g., INTJ, ENFP)';
