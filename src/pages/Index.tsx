import { useEffect } from "react";
import AuthForm from "@/components/AuthForm";

type IndexProps = {
  onAuthSuccess: () => void;
};

const Index = ({ onAuthSuccess }: IndexProps) => {
  useEffect(() => {
    document.title = "GiffyDuck - LogIn";
  }, []);

  const handleGuestLogin = () => {
    // simulate guest login
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="GiffyDuck Logo"
                className="h-20 w-20 object-cover rounded-full"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">GiffyDuck</h1>
          <p className="text-muted-foreground mb-8">
            Take smarter notes with AI-powered insights and analysis.
          </p>
        </div>

        <AuthForm onSuccess={onAuthSuccess} />

        <div className="text-center text-sm text-muted-foreground mt-8 space-y-4">
          <p>
            💡 Explore GiffyDuck’s
            AI-powered features instantly with a guest session!
          </p>
          <button
            onClick={handleGuestLogin}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-300"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
