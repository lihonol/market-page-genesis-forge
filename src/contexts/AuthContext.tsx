
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (username: string, password: string, role: "admin" | "user") => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS = [
  { id: "1", username: "admin", password: "admin", role: "admin" as const },
  { id: "2", username: "user", password: "user", role: "user" as const }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for saved authentication
    const savedUser = localStorage.getItem("bookmarket_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("bookmarket_user");
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(
          (u) => u.username === username && u.password === password
        );
        
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem("bookmarket_user", JSON.stringify(userWithoutPassword));
          toast({
            title: "Login successful",
            description: `Welcome back, ${username}!`,
          });
          resolve();
        } else {
          toast({
            title: "Login failed",
            description: "Invalid username or password",
            variant: "destructive",
          });
          reject(new Error("Invalid credentials"));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bookmarket_user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const createUser = async (username: string, password: string, role: "admin" | "user") => {
    // In a real app, this would make an API call to create the user
    return new Promise<void>((resolve, reject) => {
      // Check if username already exists
      if (MOCK_USERS.some((u) => u.username === username)) {
        toast({
          title: "User creation failed",
          description: "Username already exists",
          variant: "destructive",
        });
        reject(new Error("Username already exists"));
        return;
      }

      // Create new user (in a real app, this would be saved to a database)
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        username,
        password,
        role,
      };
      MOCK_USERS.push(newUser);

      toast({
        title: "User created",
        description: `New ${role} account created for ${username}`,
      });
      resolve();
    });
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    // In a real app, this would make an API call to change the password
    return new Promise<void>((resolve, reject) => {
      if (!user) {
        reject(new Error("Not authenticated"));
        return;
      }

      const userIndex = MOCK_USERS.findIndex((u) => u.id === user.id);
      if (userIndex === -1 || MOCK_USERS[userIndex].password !== oldPassword) {
        toast({
          title: "Password change failed",
          description: "Current password is incorrect",
          variant: "destructive",
        });
        reject(new Error("Current password is incorrect"));
        return;
      }

      // Update password (in a real app, this would update a database)
      MOCK_USERS[userIndex].password = newPassword;

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      });
      resolve();
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        createUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
