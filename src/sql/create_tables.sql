-- Drop the existing tables if they exist
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS creative_writings;

-- Create the notes table
CREATE TABLE notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    type TEXT DEFAULT 'academic',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the creative writings table
CREATE TABLE creative_writings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'general',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices for better performance
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX creative_writings_user_id_idx ON creative_writings(user_id);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_writings ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security for notes
CREATE POLICY "Users can view their own notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
ON notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON notes FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for Row Level Security for creative_writings
CREATE POLICY "Users can view their own writings"
ON creative_writings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own writings"
ON creative_writings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own writings"
ON creative_writings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own writings"
ON creative_writings FOR DELETE
USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creative_writings_updated_at
    BEFORE UPDATE ON creative_writings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 