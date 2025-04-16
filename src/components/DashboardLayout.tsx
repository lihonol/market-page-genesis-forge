
import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { isOpen } = useSidebar();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isOpen ? "ml-64" : "ml-16"
        )}
      >
        <header className="h-16 border-b flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">{title || "Dashboard"}</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
