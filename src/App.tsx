
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import ClientLogin from "./pages/ClientLogin";
import AdminRegistration from "./pages/AdminRegistration";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SalonSetup from "./pages/SalonSetup";
import BusinessSetup from "./pages/BusinessSetup";
import PlanSelection from "./pages/PlanSelection";
import SalonSelection from "./pages/SalonSelection";
import ClientBooking from "./pages/ClientBooking";
import SalonLink from "./pages/SalonLink";
import ServicesPage from "./pages/ServicesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <SecurityHeaders />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/client-login" element={<ClientLogin />} />
              <Route path="/admin-registration" element={<AdminRegistration />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
              <Route path="/salon-setup" element={<SalonSetup />} />
              <Route path="/business-setup" element={<BusinessSetup />} />
              <Route path="/plan-selection" element={<PlanSelection />} />
              <Route path="/salon-selection" element={<SalonSelection />} />
              <Route path="/booking/:salonSlug" element={<ClientBooking />} />
              <Route path="/salon/:salonSlug" element={<SalonLink />} />
              <Route path="/services" element={<ServicesPage services={[]} onRefresh={() => {}} />} />
              <Route path="/settings" element={<SettingsPage salon={null} onRefresh={() => {}} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
