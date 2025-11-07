import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type User = {
  id: string;
  email: string;
  name: string;
};

const STORAGE_KEY = 'insight_notes_app_user';

/**
 * Get the current authenticated user from Supabase Auth.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return null;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    return {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email?.split("@")[0] || "",
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

/**
 * Log in an existing user using email and password.
 */
export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive",
    });
    throw new Error(error.message);
  }

  const user = data.user;
  if (!user) throw new Error("No user data returned");

  const userData: User = {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "",
  };

  toast({
    title: "Login successful",
    description: `Welcome back, ${userData.name}!`,
  });

  return userData;
};

/**
 * Register a new user and trigger confirmation email.
 */
export const register = async (email: string, password: string, name: string): Promise<void> => {
  const redirectURL = "https://www.giffyduck.com/"; // 👈 your live domain

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectURL,
      data: { name },
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
    // Insert into 'users' table for profile management
    try {
      await supabase.from("users").upsert({
        id: data.user.id,
        email,
        name,
      });
    } catch (err) {
      console.error("Error creating user profile:", err);
    }

    toast({
      title: "Registration successful",
      description: "Check your inbox and confirm your email to activate your account.",
    });
  }
};

/**
 * Log out the currently authenticated user.
 */
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
