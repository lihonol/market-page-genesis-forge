
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, themeStyles } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    setLoading(true);
    
    try {
      await login(username, password);
      navigate("/");
    } catch (error) {
      // Error handling is done in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${themeStyles.gradient}`}>
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto bg-primary rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg">
            <Book className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Book Market</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
        </div>

        <Card className={`backdrop-blur-sm ${themeStyles.cardGradient} border-white/10 shadow-xl`}>
          <CardHeader>
            <CardTitle className="text-center text-xl">Welcome Back</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className={`w-full ${themeStyles.buttonGradient}`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          Default credentials: <strong>admin / admin</strong> or <strong>user / user</strong>
        </div>
      </div>
    </div>
  );
}
