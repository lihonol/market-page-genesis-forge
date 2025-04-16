
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Add a small delay to ensure context is fully initialized
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Book Market</h1>
        <p className="mt-4">Redirecting...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
