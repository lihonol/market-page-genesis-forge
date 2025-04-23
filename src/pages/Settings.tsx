
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

  // رفع مشکل صفحه غیر موجود
  // اکنون می‌شود از route پشتیبانی و تنظیم کرد

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card className="bg-gradient-to-tr from-indigo-900 via-fuchsia-900 to-cyan-900 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-gradient-primary">Theme Settings</CardTitle>
            <CardDescription>
              ظاهر سایت را سفارشی کنید
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

        <Card className="bg-gradient-to-tr from-cyan-800 via-indigo-900 to-fuchsia-900 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Default Link Settings</CardTitle>
            <CardDescription>
              لینک پیش‌فرض ساخت لینک کوتاه را تغییر دهید
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
                  این لینک به عنوان پیشوند تمام لینک‌های جدید استفاده می‌شود (مثال: http://localhost:8080)
                </p>
              </div>
              <div className="p-4 border rounded-lg mt-4 bg-gradient-to-br from-fuchsia-900 to-indigo-900">
                <h3 className="text-sm font-semibold mb-2">Current Default Link</h3>
                <div className="p-2 bg-muted rounded-md">
                  <span className="text-sm break-all">{defaultLink}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  کاراکترهای تصادفی به انتهای این آدرس اضافه می‌شود. روی لوکال هاست هم کار می‌کند اگر فایل یا صفحه موردنظر دقیقا آن مسیر را داشته باشد.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
