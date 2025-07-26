-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First check if the table already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'creative_writings'
    ) THEN
        -- Create the creative_writings table
        CREATE TABLE public.creative_writings (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            tags TEXT[] DEFAULT '{}',
            category TEXT DEFAULT 'general',
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies for creative_writings
        ALTER TABLE public.creative_writings ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view their own creative writings" 
            ON public.creative_writings 
            FOR SELECT 
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own creative writings" 
            ON public.creative_writings 
            FOR INSERT 
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own creative writings" 
            ON public.creative_writings 
            FOR UPDATE 
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own creative writings" 
            ON public.creative_writings 
            FOR DELETE 
            USING (auth.uid() = user_id);

        -- Create function to handle updated_at
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger for updated_at
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.creative_writings
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();

        -- Add comment to table
        COMMENT ON TABLE public.creative_writings IS 'Stores user creative writings with categories';
    END IF;
END
$$;

-- Create RPC function to create the table
CREATE OR REPLACE FUNCTION public.create_creative_writings_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'creative_writings'
    ) INTO table_exists;
    
    IF table_exists THEN
        RETURN TRUE;
    END IF;

    -- Create the creative_writings table
    CREATE TABLE public.creative_writings (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        tags TEXT[] DEFAULT '{}',
        category TEXT DEFAULT 'general',
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add RLS policies
    ALTER TABLE public.creative_writings ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own creative writings" 
        ON public.creative_writings 
        FOR SELECT 
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own creative writings" 
        ON public.creative_writings 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own creative writings" 
        ON public.creative_writings 
        FOR UPDATE 
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own creative writings" 
        ON public.creative_writings 
        FOR DELETE 
        USING (auth.uid() = user_id);

    -- Create trigger for updated_at
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.creative_writings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

    -- Add comment to table
    COMMENT ON TABLE public.creative_writings IS 'Stores user creative writings with categories';
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating creative_writings table: %', SQLERRM;
        RETURN FALSE;
END;
$$; 