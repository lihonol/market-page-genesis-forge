
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DataProvider } from '@/contexts/DataContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Search = lazy(() => import('./pages/Search'));
const LinkGenerator = lazy(() => import('./pages/LinkGenerator'));
const Settings = lazy(() => import('./pages/Settings'));
const Database = lazy(() => import('./pages/Database'));
const AccountChangePassword = lazy(() => import('./pages/AccountChangePassword'));
const AccountCreateUser = lazy(() => import('./pages/AccountCreateUser'));
const AccountChangeAdminPassword = lazy(() => import('./pages/AccountChangeAdminPassword'));
const PagePreview = lazy(() => import('./pages/PagePreview'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SettingsProvider>
            <DataProvider>
              <SidebarProvider>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/preview/:id" element={<PagePreview />} />
                    <Route path="/l/:id" element={<PagePreview />} />
                    
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                    <Route path="/link-generator" element={<ProtectedRoute><LinkGenerator /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/database" element={<ProtectedRoute><Database /></ProtectedRoute>} />
                    <Route path="/account/change-password" element={<ProtectedRoute><AccountChangePassword /></ProtectedRoute>} />
                    <Route path="/account/create-user" element={<ProtectedRoute><AccountCreateUser /></ProtectedRoute>} />
                    <Route path="/account/admin-password" element={<ProtectedRoute><AccountChangeAdminPassword /></ProtectedRoute>} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Toaster />
              </SidebarProvider>
            </DataProvider>
          </SettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
