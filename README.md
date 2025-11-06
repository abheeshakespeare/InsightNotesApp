# GiffyDuck - Notes

A powerful note-taking application with AI integration and creative writing capabilities.

## Features

- **Academic Notes**: Easily organize and manage your academic notes
- **Creative Writing**: Express your creativity with dedicated writing tools
- **AI Assistant**: Get insights and answers based on your notes
- **Tag Management**: Organize content with customizable tags
- **Full-text Search**: Quickly find what you need

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/insight-notes.git
cd insight-notes
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Create a Supabase account and project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Update the Supabase URL and anon key in `.env.local` (found in Supabase dashboard under Settings > API)

### 4. Database Setup

Run these SQL commands in the Supabase SQL Editor:

1. Enable the UUID extension:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

2. Create tables:
   - Run the scripts in `src/sql/create_creative_writings.sql` 
   - This will create the necessary tables and RPC functions

### 5. Start the Development Server

```bash
npm run dev
```

## Troubleshooting

### Missing Tables Error

If you encounter an error about missing tables:

1. Check that you've run the SQL scripts in the Supabase SQL Editor
2. Ensure your environment variables are correctly set
3. Verify that your Supabase permissions are properly configured

### API Connection Issues

If the application can't connect to Supabase:

1. Verify your environment variables
2. Check your network connection
3. Ensure the Supabase project is active

## License

**© Abhishek Kr. Mishra**
