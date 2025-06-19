
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SalonSelection from "./pages/SalonSelection";
import PlanSelection from "./pages/PlanSelection";
import ServicesPage from "./pages/ServicesPage";
import SettingsPage from "./pages/SettingsPage";
import SalonSetup from "./pages/SalonSetup";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
          <Route path="/salon-selection" element={<SalonSelection />} />
          <Route path="/plan-selection" element={<PlanSelection />} />
          <Route path="/services" element={<ServicesPage services={[]} onRefresh={() => {}} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/salon-setup" element={<SalonSetup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
