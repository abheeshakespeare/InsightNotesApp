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
    console.log("[getCurrentUser] Fetching current session...");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("[getCurrentUser] Session error:", sessionError);
      return null;
    }
    if (!session) {
      console.warn("[getCurrentUser] No active session found.");
      return null;
    }

    console.log("[getCurrentUser] Fetching user info...");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("[getCurrentUser] User fetch error:", userError);
      return null;
    }
    if (!user) {
      console.warn("[getCurrentUser] No user returned from Supabase.");
      return null;
    }

    const userData = {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email?.split("@")[0] || "",
    };

    console.log("[getCurrentUser] Current user:", userData);
    return userData;
  } catch (error) {
    console.error("[getCurrentUser] Exception:", error);
    return null;
  }
};

/**
 * Log in an existing user using email and password.
 */
export const login = async (email: string, password: string): Promise<User> => {
  console.log("[login] Attempting login with:", email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  console.log("[login] Response:", data, error);

  if (error) {
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive",
    });
    throw new Error(error.message);
  }

  const user = data.user;
  if (!user) {
    console.error("[login] No user returned from Supabase.");
    throw new Error("No user data returned");
  }

  const userData: User = {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "",
  };

  console.log("[login] Logged in user data:", userData);

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

  console.log("[register] Starting signup...");
  console.log("[register] Email:", email);
  console.log("[register] Redirect URL:", redirectURL);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectURL,
      data: { name },
    },
  });

  console.log("[register] Signup response:", data, error);

  if (error) {
    console.error("[register] Supabase signup error:", error.message);
    toast({
      title: "Registration failed",
      description: error.message,
      variant: "destructive",
    });
    throw new Error(error.message);
  }

  if (data.user) {
    console.log("[register] User created:", data.user);

    // Insert into 'users' table for profile management
    try {
      console.log("[register] Inserting into 'users' table...");
      const { error: insertError } = await supabase.from("users").upsert({
        id: data.user.id,
        email,
        name,
      });
      if (insertError) console.error("[register] Error inserting user profile:", insertError);
      else console.log("[register] User profile inserted successfully.");
    } catch (err) {
      console.error("[register] Exception inserting user profile:", err);
    }

    toast({
      title: "Registration successful",
      description: "Check your inbox and confirm your email to activate your account.",
    });
  } else {
    console.warn("[register] No user object returned from Supabase signup.");
  }
};

/**
 * Log out the currently authenticated user.
 */
export const logout = async (): Promise<void> => {
  console.log("[logout] Logging out user...");
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[logout] Error during logout:", error.message);
    toast({
      title: "Logout failed",
      description: error.message,
      variant: "destructive",
    });
    throw new Error(error.message);
  }

  console.log("[logout] Logout successful.");
  toast({
    title: "Logged out",
    description: "You have been logged out successfully",
  });
};
