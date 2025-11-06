import { useEffect, useState } from "react";
import { FileText, Home, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { getUserProfile } from "@/services/userService";

type SidebarProps = {
  isOpen: boolean;
  closeSidebar: () => void;
};

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const isMobile = useIsMobile();
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile();
        if (profile?.name) {
          const firstName = profile.name.split(" ")[0];
          setUserName(firstName);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const sidebarClass = isMobile
    ? `fixed inset-y-0 left-0 z-50 bg-sidebar transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : "bg-sidebar";

  const items = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "All Notes", href: "/notes", icon: FileText },
    { name: "Your Creativity", href: "/creativity", icon: Sparkles },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <div
        className={`${sidebarClass} flex w-64 flex-col border-r border-sidebar-border`}
      >
        {/* --- Header Greeting --- */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          {isLoading ? (
            <h1 className="text-sm text-muted-foreground animate-pulse">
              Loading...
            </h1>
          ) : (
            <h1 className="text-lg font-semibold text-primary transition-all duration-300">
              {userName ? `Welcome back, ${userName}` : "Welcome!"}
            </h1>
          )}
        </div>

        {/* --- Scrollable Navigation --- */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                asChild
                onClick={isMobile ? closeSidebar : undefined}
              >
                <Link to={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </Button>
            ))}
          </div>

          <Separator className="my-4 bg-sidebar-border" />

          {/* --- Tags Section --- */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-sidebar-foreground/60 px-3 pt-2">
              Tags
            </p>

            {[
              { color: "bg-blue-500", label: "Important" },
              { color: "bg-green-500", label: "Work" },
              { color: "bg-purple-500", label: "Ideas" },
            ].map((tag) => (
              <Button
                key={tag.label}
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${tag.color} mr-2`}
                ></span>
                <span>{tag.label}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;
