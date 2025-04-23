
import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { isOpen } = useSidebar();
  const navigate = useNavigate();
  const { themeStyles } = useTheme();

  return (
    <div className={`min-h-screen flex ${themeStyles.gradient}`}>
      <Sidebar />

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          themeStyles.background,
          isOpen ? "ml-64" : "ml-16"
        )}
      >
        <header
          className={`h-16 border-b flex items-center justify-between px-6 shadow-md ${themeStyles.gradient}`}
        >
          <h1 className="text-xl font-semibold text-gradient-primary">{title || "Dashboard"}</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
