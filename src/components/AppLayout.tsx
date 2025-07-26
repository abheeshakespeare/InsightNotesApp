
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

type AppLayoutProps = {
  onLogout: () => void;
};

const AppLayout = ({ onLogout }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkTheme(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);
  
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        toggleSidebar={toggleSidebar} 
        onLogout={onLogout} 
        toggleTheme={toggleTheme}
        isDarkTheme={isDarkTheme}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
