-- Add the new column for eating in room
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS eating_in_room TEXT;

-- Add the new column for social room preference
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS social_room_preference TEXT;

-- Rename guests_frequency to overnight_guests if it doesn't match our new schema
-- This is a safe operation as we're keeping the data but changing the name to match our new schema
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'guests_frequency'
    ) THEN
        -- Only rename if overnight_guests doesn't already exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'user_preferences' 
            AND column_name = 'overnight_guests'
        ) THEN
            ALTER TABLE user_preferences RENAME COLUMN guests_frequency TO overnight_guests;
        END IF;
    END IF;
END $$;

-- We're keeping these columns for backward compatibility, but they won't be used in the new questionnaire:
-- study_preference
-- schedule_type
-- conflict_resolution
