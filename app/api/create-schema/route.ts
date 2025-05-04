import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a new Supabase client for this API route
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      persistSession: false,
    },
  },
)

export async function GET() {
  try {
    // Enable UUID extension if not already enabled
    await executeSQL(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    // Create universities table first (since it's referenced by profiles)
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS universities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        domain TEXT NOT NULL UNIQUE,
        location TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create profiles table (extends Supabase auth.users)
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        university_id UUID REFERENCES universities(id),
        major TEXT,
        year TEXT,
        bio TEXT,
        phone TEXT,
        instagram TEXT,
        twitter TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create user preferences table (from questionnaire)
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        sleep_schedule TEXT,
        study_preference TEXT,
        cleanliness TEXT,
        guests_frequency TEXT,
        noise_tolerance TEXT,
        sharing_comfort TEXT,
        schedule_type TEXT,
        overnight_guests TEXT,
        temperature_preference TEXT,
        conflict_resolution TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create privacy settings table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS privacy_settings (
        user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
        show_email BOOLEAN DEFAULT false,
        show_phone BOOLEAN DEFAULT false,
        show_social_media BOOLEAN DEFAULT false,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create matches table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        user_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        compatibility_score INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
        user_1_action TEXT, -- liked, passed
        user_2_action TEXT, -- liked, passed
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_match UNIQUE(user_id_1, user_id_2),
        CONSTRAINT different_users CHECK(user_id_1 <> user_id_2)
      );
    `)

    // Create messages table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create housing deadlines table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS housing_deadlines (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        deadline_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Setup RLS policies
    await setupRLS()

    return NextResponse.json({ success: true, message: "Database schema created successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Helper function to execute SQL
async function executeSQL(sql: string) {
  const { error } = await supabaseAdmin.rpc("exec_sql", { query: sql })
  if (error) throw error
  return true
}

async function setupRLS() {
  // Enable RLS on all tables
  const tables = [
    "profiles",
    "universities",
    "user_preferences",
    "privacy_settings",
    "matches",
    "messages",
    "housing_deadlines",
  ]

  for (const table of tables) {
    await executeSQL(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`)
  }

  // Create policies for profiles
  await executeSQL(`
    CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

    CREATE POLICY "Users can view other profiles"
    ON profiles FOR SELECT
    USING (true);
  `)

  // Create policies for user_preferences
  await executeSQL(`
    CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  `)

  // Create policies for privacy_settings
  await executeSQL(`
    CREATE POLICY "Users can view their own privacy settings"
    ON privacy_settings FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own privacy settings"
    ON privacy_settings FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own privacy settings"
    ON privacy_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  `)

  // Create policies for matches
  await executeSQL(`
    CREATE POLICY "Users can view their own matches"
    ON matches FOR SELECT
    USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

    CREATE POLICY "Users can update their own matches"
    ON matches FOR UPDATE
    USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
  `)

  // Create policies for messages
  await executeSQL(`
    CREATE POLICY "Users can view messages in their matches"
    ON messages FOR SELECT
    USING (
      auth.uid() IN (
        SELECT user_id_1 FROM matches WHERE id = match_id
        UNION
        SELECT user_id_2 FROM matches WHERE id = match_id
      )
    );

    CREATE POLICY "Users can insert messages in their matches"
    ON messages FOR INSERT
    WITH CHECK (
      auth.uid() = sender_id AND
      auth.uid() IN (
        SELECT user_id_1 FROM matches WHERE id = match_id
        UNION
        SELECT user_id_2 FROM matches WHERE id = match_id
      )
    );
  `)

  // Create policies for universities and housing_deadlines
  await executeSQL(`
    CREATE POLICY "Anyone can view universities"
    ON universities FOR SELECT
    USING (true);

    CREATE POLICY "Anyone can view housing deadlines"
    ON housing_deadlines FOR SELECT
    USING (true);
  `)
}
