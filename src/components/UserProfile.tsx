import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/services/authService";
import { getUserProfile, updateUserProfile } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const authUser = await getCurrentUser();
        const profile = await getUserProfile();
        if (authUser) setEmail(authUser.email);
        if (profile) {
          setName(profile.name || "");
          setPhone(profile.phone || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(name, phone);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const getInitial = () => {
    return name.trim().charAt(0).toUpperCase() || "U";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {getInitial()}
          </div>
        </div>
        <CardTitle className="text-xl">User Profile</CardTitle>
        <CardDescription className="text-sm">Manage your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            disabled 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input 
            id="phone" 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
          />
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6">
        <Button onClick={handleSubmit} className="w-full">
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;