import { BrainCircuit, FileText, Home, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

type SidebarProps = {
  isOpen: boolean;
  closeSidebar: () => void;
};

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const isMobile = useIsMobile();
  
  const sidebarClass = isMobile
    ? `fixed inset-y-0 left-0 z-50 bg-sidebar transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : "bg-sidebar";
  
  const items = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "All Notes",
      href: "/notes",
      icon: FileText,
    },
    {
      name: "Your Creativity",
      href: "/creativity",
      icon: Sparkles,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
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
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-sidebar-primary" />
            <h2 className="text-lg font-semibold text-sidebar-foreground">InsightNotes</h2>
          </div>
        </div>
        
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
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-sidebar-foreground/60 px-3 pt-2">
              Tags
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
              <span>Important</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
              <span>Work</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>
              <span>Ideas</span>
            </Button>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;
