-- Rename guests_frequency to social_room_preference
ALTER TABLE user_preferences RENAME COLUMN guests_frequency TO social_room_preference;

-- Rename study_preference to eating_in_room
ALTER TABLE user_preferences RENAME COLUMN study_preference TO eating_in_room;

-- Add MBTI personality column for future use
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS mbti_personality TEXT;

-- We'll keep these columns for backward compatibility:
-- schedule_type
-- conflict_resolution
