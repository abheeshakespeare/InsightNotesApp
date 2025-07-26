-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify the extension is enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'uuid-ossp';

-- Test UUID generation
SELECT uuid_generate_v4(); 