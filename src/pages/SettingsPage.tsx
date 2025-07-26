
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and account settings.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Configure how the application works for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-features">AI Features</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered insights and analysis.
              </p>
            </div>
            <Switch id="ai-features" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode for a better night-time experience.
              </p>
            </div>
            <Switch id="dark-mode" />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for new insights and reminders.
              </p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account and subscription details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="font-medium">Current Plan</p>
            <p className="text-sm text-muted-foreground">Free Plan</p>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <p className="font-medium">Storage Used</p>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="bg-primary h-full w-1/5"></div>
            </div>
            <p className="text-sm text-muted-foreground">100KB of 5MB used</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Change Plan</Button>
          <Button variant="destructive">Delete Account</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsPage;
