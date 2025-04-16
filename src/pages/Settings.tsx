
import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Link } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { defaultLink, setDefaultLink } = useSettings();
  const [linkInput, setLinkInput] = useState(defaultLink);
  
  const handleDefaultLinkChange = () => {
    setDefaultLink(linkInput);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>
              Customize the appearance of Book Market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-6 w-6" />
                <span>Light Theme</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-6 w-6" />
                <span>Dark Theme</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Link Settings</CardTitle>
            <CardDescription>
              Change the base URL for generated links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultLink">Default Link</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="defaultLink"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      className="pl-10"
                      placeholder="https://example.com"
                    />
                  </div>
                  <Button onClick={handleDefaultLinkChange}>Save</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This link will be used as the base URL for all generated links
                </p>
              </div>

              <div className="p-4 border rounded-lg mt-4">
                <h3 className="text-sm font-semibold mb-2">Current Default Link</h3>
                <div className="p-2 bg-muted rounded-md">
                  <span className="text-sm break-all">{defaultLink}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Random characters will be appended to this link when generating new links
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
