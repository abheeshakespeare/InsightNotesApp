import { useState } from "react";
import { BrainCircuit, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { logout } from "@/services/authService";
import UserProfile from "@/components/UserProfile";

type HeaderProps = {
  toggleSidebar: () => void;
  onLogout: () => void;
};

const Header = ({ toggleSidebar, onLogout }: HeaderProps) => {
  const isMobile = useIsMobile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-800 bg-[#0f172a] px-4 md:px-6 text-gray-100">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="GiffyDuck Logo"
            className="h-12 w-12 object-contain"
          />
          <h1 className="text-lg font-semibold text-blue-300">GiffyDuck</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2 text-gray-200 hover:text-blue-400">
              <User className="h-5 w-5" />
              <span className="sr-only">User profile</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <UserProfile />
          </DialogContent>
        </Dialog>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="ml-2 text-gray-200 hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default Header;
