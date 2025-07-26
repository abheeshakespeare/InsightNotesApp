import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type CreativeWritingRow = Database['public']['Tables']['creative_writings']['Row'];
type CreativeWritingInsert = Database['public']['Tables']['creative_writings']['Insert'];
type CreativeWritingUpdate = Database['public']['Tables']['creative_writings']['Update'];

export type CreativeWriting = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  userId: string;
  category: string | null;
};

const getCurrentUserId = async (): Promise<string | null> => {
  try {
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }
    
    if (!session) {
      console.log('No active session found');
      return null;
    }
    
    // Then get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
      return null;
    }
    
    if (!user) {
      console.log('No user found');
      return null;
    }
    
    console.log('Current user:', user.id);
    return user.id;
  } catch (error) {
    console.error('Error in getCurrentUserId:', error);
    return null;
  }
};

const mapWritingRowToCreativeWriting = (row: CreativeWritingRow): CreativeWriting => ({
  id: row.id,
  title: row.title,
  content: row.content || '',
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  tags: row.tags || [],
  userId: row.user_id,
  category: row.category
});

export const getCreativeWritings = async (category?: string): Promise<CreativeWriting[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  let query = supabase
    .from('creative_writings')
    .select('*')
    .eq('user_id', userId);
    
  // Filter by category if specified
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching creative writings:', error);
    return [];
  }

  return data.map(mapWritingRowToCreativeWriting);
};

// Get writings by category
export const getWritingsByCategory = async (category: string): Promise<CreativeWriting[]> => {
  return getCreativeWritings(category);
};

export const getCreativeWriting = async (id: string): Promise<CreativeWriting | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('creative_writings')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching creative writing:', error);
    return null;
  }

  return mapWritingRowToCreativeWriting(data);
};

export const saveCreativeWriting = async (writing: Partial<CreativeWriting>): Promise<CreativeWritingRow | null> => {
  try {
    console.log('Saving creative writing:', writing);
    
    // Get the current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to save writings",
        variant: "destructive",
      });
      return null;
    }
    
    let result;

    // Check if this is an update or an insert
    if (writing.id) {
      console.log(`Updating existing creative writing with ID: ${writing.id}`);
      
      // Format data for update
      const updateData: CreativeWritingUpdate = {
        title: writing.title,
        content: writing.content,
        tags: writing.tags,
        category: writing.category,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('creative_writings')
        .update(updateData)
        .eq('id', writing.id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating creative writing with ID ${writing.id}:`, error);
        throw error;
      }

      result = data;
      toast({
        title: "Success",
        description: "Creative writing updated successfully",
      });
    } else {
      console.log('Creating new creative writing');
      
      // Format data for insert
      const insertData: CreativeWritingInsert = {
        title: writing.title || 'Untitled',
        content: writing.content,
        tags: writing.tags || [],
        category: writing.category || 'general',
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('creative_writings')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating new creative writing:', error);
        
        // Check for specific errors
        if (error.message?.includes('relation "creative_writings" does not exist')) {
          toast({
            title: "Database Error",
            description: "Database table 'creative_writings' does not exist. Please run the SQL setup script.",
            variant: "destructive",
          });
          console.error('Please ensure the creative_writings table has been created in your Supabase project.');
        } else {
          throw error;
        }
      }

      result = data;
      toast({
        title: "Success",
        description: "Creative writing saved successfully",
      });
    }

    return result || null;
  } catch (error: any) {
    console.error('Failed to save creative writing:', error);
    toast({
      title: "Error",
      description: `Failed to save creative writing: ${error.message || 'Unknown error'}`,
      variant: "destructive",
    });
    return null;
  }
};

export const updateCreativeWriting = async (id: string, writing: Partial<CreativeWriting>): Promise<CreativeWriting> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('creative_writings')
    .update({
      title: writing.title,
      content: writing.content,
      tags: writing.tags,
      category: writing.category,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating creative writing:', error);
    throw error;
  }

  return mapWritingRowToCreativeWriting(data);
};

export const deleteCreativeWriting = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting creative writing with ID: ${id}`);
    const { error } = await supabase
      .from('creative_writings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting creative writing with ID ${id}:`, error);
      throw error;
    }

    toast({
      title: "Success",
      description: "Creative writing deleted successfully",
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete creative writing with ID ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to delete creative writing",
      variant: "destructive",
    });
    return false;
  }
};

export const addSelectedTextToCreativeWriting = async (selectedText: string, writingId: string): Promise<boolean> => {
  try {
    console.log(`Adding selected text to writing ${writingId}:`, selectedText);
    
    const writing = await getCreativeWriting(writingId);
    if (!writing) {
      console.error("Writing not found:", writingId);
      return false;
    }
    
    const updatedWriting = {
      ...writing,
      content: writing.content + '\n\n' + selectedText,
    };
    
    console.log("Updating writing with new content");
    await updateCreativeWriting(updatedWriting.id, updatedWriting);
    console.log("Successfully added text to writing");
    return true;
  } catch (error) {
    console.error("Error adding selected text to creative writing:", error);
    return false;
  }
};

export async function getCreativeWritingCategories(): Promise<string[]> {
  try {
    console.log('Fetching unique creative writing categories');
    const { data, error } = await supabase
      .from('creative_writings')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching creative writing categories:', error);
      throw error;
    }

    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
    console.log(`Retrieved ${categories.length} unique categories`);
    return categories;
  } catch (error) {
    console.error('Failed to fetch creative writing categories:', error);
    return [];
  }
}

export async function createCreativeWritingsTable() {
  try {
    console.log('Checking if creative_writings table exists...');
    const { error: checkError } = await supabase
      .from('creative_writings')
      .select('count')
      .limit(1);
    
    if (checkError && checkError.message.includes('relation "creative_writings" does not exist')) {
      console.log('Creative_writings table does not exist. Running SQL script...');
      
      // Execute the SQL directly (in a real app, this would need admin privileges)
      const { error } = await supabase.auth.signInWithPassword({
        email: import.meta.env.VITE_SUPABASE_ADMIN_EMAIL || '',
        password: import.meta.env.VITE_SUPABASE_ADMIN_PASSWORD || ''
      });
      
      if (error) {
        console.error('Unable to run SQL - admin credentials required:', error);
        toast({
          title: "Setup Required",
          description: "Please set up your database by running the create_creative_writings.sql script in the Supabase SQL Editor.",
          variant: "destructive",
        });
        return false;
      }
      
      // Inform user to run the SQL script
      toast({
        title: "Database Setup Required",
        description: "Please run the SQL script in the src/sql directory to set up the required tables.",
        variant: "destructive",
      });
      return false;
    } else if (checkError) {
      console.error('Error checking creative_writings table:', checkError);
      return false;
    }
    
    console.log('creative_writings table already exists');
    return true;
  } catch (error) {
    console.error('Failed to create creative_writings table:', error);
    toast({
      title: "Error",
      description: "Failed to check database tables. Please run the SQL setup script.",
      variant: "destructive",
    });
    return false;
  }
} 