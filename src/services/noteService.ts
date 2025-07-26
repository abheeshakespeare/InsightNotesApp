import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type NoteRow = Database['public']['Tables']['notes']['Row'];

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  userId: string;
  type: 'academic' | 'creative';
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

const mapNoteRowToNote = (row: NoteRow): Note => ({
  id: row.id,
  title: row.title,
  content: row.content || '',
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  tags: row.tags || [],
  userId: row.user_id,
  type: row.type as 'academic' | 'creative' || 'academic' // Default to academic
});

export const getNotes = async (type?: 'academic' | 'creative'): Promise<Note[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId);
    
  // Filter by type if specified
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data.map(mapNoteRowToNote);
};

// Get only creative notes
export const getCreativeNotes = async (): Promise<Note[]> => {
  return getNotes('creative');
};

// Get only academic notes
export const getAcademicNotes = async (): Promise<Note[]> => {
  return getNotes('academic');
};

export const getNote = async (id: string): Promise<Note | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching note:', error);
    return null;
  }

  return mapNoteRowToNote(data);
};

export const saveNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Note> => {
  try {
    // First check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', { session: !!session, error: sessionError });

    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Session error: ' + sessionError.message);
    }

    if (!session) {
      console.error('No active session');
      throw new Error('No active session found');
    }

    // Get user ID
    const userId = session.user.id;
    console.log('Current user ID:', userId);

    if (!userId) {
      throw new Error('No user ID found in session');
    }

    const noteData = {
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      type: note.type || 'academic', // Default to academic if not specified
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to save note with data:', noteData);

    const { data, error } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from save operation');
    }

    console.log('Raw data from database:', data);

    const savedNote = mapNoteRowToNote(data);
    console.log('Mapped note data:', savedNote);
    
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully",
    });
    
    return savedNote;
  } catch (error) {
    console.error('Error in saveNote:', error);
    toast({
      title: "Error saving note",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive",
    });
    throw error;
  }
};

export const updateNote = async (id: string, note: Partial<Note>): Promise<Note> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .update({
      title: note.title,
      content: note.content,
      tags: note.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }

  return mapNoteRowToNote(data);
};

export const deleteNote = async (id: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const addSelectedTextToNote = async (noteId: string, selectedText: string): Promise<boolean> => {
  try {
    const note = await getNote(noteId);
    if (!note) return false;
    
    const updatedNote = {
      ...note,
      content: note.content + '\n\n' + selectedText,
    };
    
    await updateNote(updatedNote.id, updatedNote);
    return true;
  } catch (error) {
    console.error("Error adding selected text to note:", error);
    return false;
  }
};
