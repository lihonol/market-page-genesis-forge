
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Link2, 
  Search, 
  Database, 
  Settings, 
  User, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Lock,
  UserPlus,
  Sun,
  Moon,
  Link
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSidebar } from "@/contexts/SidebarContext";

export function Sidebar() {
  const { isOpen, toggle } = useSidebar();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "h-full fixed left-0 top-0 z-40 flex flex-col border-r bg-card transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className={cn("font-semibold text-lg truncate", !isOpen && "opacity-0")}>
          Book Market
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="shrink-0"
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1">
        {/* Link Generator */}
        <Button
          variant={location.pathname === "/link-generator" ? "secondary" : "ghost"}
          className={cn("justify-start", !isOpen && "justify-center")}
          onClick={() => navigate("/link-generator")}
        >
          <Link2 className="h-5 w-5 mr-2 shrink-0" />
          {isOpen && <span>Link Generator</span>}
        </Button>

        {/* Search */}
        <Button
          variant={location.pathname === "/search" ? "secondary" : "ghost"}
          className={cn("justify-start", !isOpen && "justify-center")}
          onClick={() => navigate("/search")}
        >
          <Search className="h-5 w-5 mr-2 shrink-0" />
          {isOpen && <span>Search</span>}
        </Button>

        {/* Database */}
        <Button
          variant={location.pathname === "/database" ? "secondary" : "ghost"}
          className={cn("justify-start", !isOpen && "justify-center")}
          onClick={() => navigate("/database")}
        >
          <Database className="h-5 w-5 mr-2 shrink-0" />
          {isOpen && <span>Database</span>}
        </Button>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={location.pathname === "/settings" ? "secondary" : "ghost"}
              className={cn("justify-start", !isOpen && "justify-center")}
            >
              <Settings className="h-5 w-5 mr-2 shrink-0" />
              {isOpen && <span>Settings</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="h-4 w-4 mr-2" />
              <span>Light Theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="h-4 w-4 mr-2" />
              <span>Dark Theme</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Link Settings</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/settings/change-link")}>
              <Link className="h-4 w-4 mr-2" />
              <span>Change Default Link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={location.pathname.startsWith("/account") ? "secondary" : "ghost"}
              className={cn("justify-start", !isOpen && "justify-center")}
            >
              <User className="h-5 w-5 mr-2 shrink-0" />
              {isOpen && <span>Account</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/account/change-password")}>
              <Lock className="h-4 w-4 mr-2" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/account/create-user")}>
              <UserPlus className="h-4 w-4 mr-2" />
              <span>Create New User</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Standalone Logout Button */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          className={cn("justify-start w-full", !isOpen && "justify-center")}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2 shrink-0" />
          {isOpen && <span>Log Out</span>}
        </Button>
      </div>
    </div>
  );
}
