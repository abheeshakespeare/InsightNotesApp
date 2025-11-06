import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define the shape of the user record
export type UserProfile = {
  id: string;
  name: string | null;
  phone: string | null;
  created_at?: string;
  updated_at?: string;
};

// ✅ Fetch or auto-create user profile
export const getUserProfile = async (): Promise<UserProfile | null> => {
  // Step 1: Get the logged-in Supabase user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User not logged in:", userError);
    return null;
  }

  // Step 2: Check if the profile exists in 'users' table
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user profile:", error);
    toast({
      title: "Error loading profile",
      description: "Could not load your profile information.",
      variant: "destructive",
    });
    return null;
  }

  // Step 3: Auto-create a new profile if missing
  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        name: user.user_metadata?.name || "",
        phone: "",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return null;
    }

    return newProfile;
  }

  return data;
};

// ✅ Update user profile
export const updateUserProfile = async (
  name: string,
  phone?: string
): Promise<UserProfile | null> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User not logged in:", userError);
    toast({
      title: "Error",
      description: "You must be logged in to update your profile.",
      variant: "destructive",
    });
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      name,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    toast({
      title: "Update failed",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }

  toast({
    title: "Profile updated",
    description: "Your information has been updated successfully.",
  });

  return data;
};
