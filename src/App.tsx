
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ClientBooking from "./pages/ClientBooking";
import SalonSelection from "./pages/SalonSelection";
import PlanSelection from "./pages/PlanSelection";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SalonSetup from "./pages/SalonSetup";
import BusinessSetup from "./pages/BusinessSetup";
import AdminRegistration from "./pages/AdminRegistration";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import ClientLogin from "./pages/ClientLogin";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/client-login" element={<ClientLogin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/client-booking" element={<ClientBooking />} />
              <Route path="/salon-selection" element={<SalonSelection />} />
              <Route path="/plan-selection" element={<PlanSelection />} />
              <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
              <Route path="/salon-setup" element={<SalonSetup />} />
              <Route path="/business-setup" element={<BusinessSetup />} />
              <Route path="/admin-registration" element={<AdminRegistration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
