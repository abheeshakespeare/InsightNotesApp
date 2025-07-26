import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { getCurrentUser } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import NotesPage from "@/pages/NotesPage";
import NoteDetailPage from "@/pages/NoteDetailPage";
import CreativityPage from "@/pages/Creativity";
import SettingsPage from "@/pages/SettingsPage";
import EditorPage from "@/pages/EditorPage";
import ReadPage from "@/pages/ReadPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// New VerifyEmail component
const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data, error } = await supabase.auth.getSession(); // Refreshes session with token from URL
        if (error) throw error;
        if (data.session) {
          setMessage("Email verified successfully! Redirecting...");
          setTimeout(() => (window.location.href = "/dashboard"), 2000); // Redirect after 2s
        } else {
          setMessage("No session found. Please try again.");
        }
      } catch (error: any) {
        setMessage(`Verification failed: ${error.message}`);
      }
    };
    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>{message}</p>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/verify-email" element={<VerifyEmail />} />
              {isAuthenticated ? (
                <Route element={<AppLayout onLogout={handleLogout} />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/notes/:id" element={<NoteDetailPage />} />
                  <Route path="/creativity" element={<CreativityPage />} />
                  <Route path="/editor/:id" element={<EditorPage />} />
                  <Route path="/editor/new" element={<EditorPage />} />
                  <Route path="/read/:id" element={<ReadPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              ) : (
                <>
                  <Route path="/" element={<Index onAuthSuccess={handleAuthSuccess} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
