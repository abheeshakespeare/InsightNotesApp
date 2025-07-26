import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = {
  id: string;
  email: string;
  name: string;
};

const STORAGE_KEY = 'insight_notes_app_user';

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError.message);
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError.message);
      return null;
    }
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive",
    });
    throw new Error(error.message);
  }
  
  const user = data.user;
  if (!user) throw new Error('No user data returned');
  
  const userData: User = {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || '',
  };
  
  toast({
    title: "Login successful",
    description: `Welcome back, ${userData.name}!`,
  });
  
  return userData;
};

export const register = async (email: string, password: string, name: string): Promise<void> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  
  if (error) {
    toast({
      title: "Registration failed",
      description: error.message,
      variant: "destructive",
    });
    throw new Error(error.message);
  }
  
  if (data.user) {
    toast({
      title: "Registration successful",
      description: "Please check your email to confirm your account.",
    });
  }
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    toast({
      title: "Logout failed",
      description: error.message,
      variant: "destructive",
    });
    throw new Error(error.message);
  }
  
  toast({
    title: "Logged out",
    description: "You have been logged out successfully",
  });
};
