
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import SalonSelection from "./pages/SalonSelection";
import PlanSelection from "./pages/PlanSelection";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SalonSetup from "./pages/SalonSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/salon-selection" element={<SalonSelection />} />
            <Route path="/plan-selection" element={<PlanSelection />} />
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
            <Route path="/salon-setup" element={<SalonSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
