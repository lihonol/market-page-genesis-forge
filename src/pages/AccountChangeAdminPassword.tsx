
import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Lock } from "lucide-react";

export default function AccountChangeAdminPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Fixed admin password for demonstration purposes
  // In a real app, this would be stored securely on the server
  const ADMIN_PASSWORD = "admin123";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (currentPassword !== ADMIN_PASSWORD) {
      setError("Current admin password is incorrect");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters long");
      return;
    }

    setLoading(true);
    
    try {
      // In a real application, this would call an API to update the password
      // For this demo, we'll simulate a successful update
      setTimeout(() => {
        localStorage.setItem("admin_password", newPassword);
        
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        toast({
          title: "Admin Password Updated",
          description: "The admin password has been changed successfully",
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Change Admin Password">
      <div className="max-w-md mx-auto">
        <Card className="backdrop-blur-sm bg-card/50 border border-white/10 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Admin Password
            </CardTitle>
            <CardDescription>
              Update the password required for administrative actions like deleting pages
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Admin Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="bg-background/50 backdrop-blur-sm"
                  placeholder="Enter current admin password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Admin Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-background/50 backdrop-blur-sm"
                  placeholder="Enter new admin password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Admin Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-background/50 backdrop-blur-sm"
                  placeholder="Confirm new admin password"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p>Current admin password: <strong>admin123</strong></p>
                <p>This password is required when deleting pages.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Admin Password"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
