
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SettingsContextType {
  defaultLink: string;
  setDefaultLink: (link: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [defaultLink, setDefaultLinkState] = useState("http://example.com");
  const { toast } = useToast();

  useEffect(() => {
    const savedLink = localStorage.getItem("bookmarket_default_link");
    if (savedLink) {
      setDefaultLinkState(savedLink);
    }
  }, []);

  const setDefaultLink = (link: string) => {
    try {
      // Simple URL validation
      new URL(link);
      setDefaultLinkState(link);
      localStorage.setItem("bookmarket_default_link", link);
      toast({
        title: "Default Link Updated",
        description: `Default link changed to: ${link}`,
      });
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsContext.Provider value={{ defaultLink, setDefaultLink }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
