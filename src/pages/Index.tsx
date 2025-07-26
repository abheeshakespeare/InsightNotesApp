
import { useEffect } from "react";
import { BrainCircuit } from "lucide-react";
import AuthForm from "@/components/AuthForm";

type IndexProps = {
  onAuthSuccess: () => void;
};

const Index = ({ onAuthSuccess }: IndexProps) => {
  useEffect(() => {
    document.title = "InsightNotes - AI-Powered Note Taking";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <BrainCircuit className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">InsightNotes</h1>
          <p className="text-muted-foreground mb-8">
            Take smarter notes with AI-powered insights and analysis.
          </p>
        </div>
        
        <AuthForm onSuccess={onAuthSuccess} />
        
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>For demo purposes, any valid email format and password (6+ chars) will work</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
