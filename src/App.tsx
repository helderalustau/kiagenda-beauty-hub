
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

// Pages
import Index from './pages/Index';
import AdminLogin from './pages/AdminLogin';
import AdminRegistration from './pages/AdminRegistration';
import AdminDashboard from './pages/AdminDashboard';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import ClientBooking from './pages/ClientBooking';
import SalonSelectionPage from './pages/SalonSelectionPage';
import SalonSelection from './pages/SalonSelection';
import SalonSetup from './pages/SalonSetup';
import BusinessSetup from './pages/BusinessSetup';
import PlanSelection from './pages/PlanSelection';
import ServicesPage from './pages/ServicesPage';
import SettingsPage from './pages/SettingsPage';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SalonLink from './pages/SalonLink';
import NotFound from './pages/NotFound';

// Components
import SalonLinkRoute from './components/SalonLinkRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/select-salon" element={<SalonSelectionPage />} />
            <Route path="/salon-selection" element={<SalonSelection />} />
            <Route path="/plan-selection" element={<PlanSelection />} />
            
            {/* Authentication Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-registration" element={<AdminRegistration />} />
            <Route path="/client-login" element={<ClientLogin />} />
            
            {/* Dashboard Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            
            {/* Booking Routes */}
            <Route path="/booking/:salonSlug" element={<ClientBooking />} />
            
            {/* Setup Routes */}
            <Route path="/salon-setup" element={<SalonSetup />} />
            <Route path="/business-setup" element={<BusinessSetup />} />
            
            {/* Management Routes */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Super Admin Routes */}
            <Route path="/super-admin-login" element={<SuperAdminLogin />} />
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
            
            {/* Salon Link Route */}
            <Route path="/salon/:slug" element={<SalonLink />} />
            <Route path="/l/:slug" element={<SalonLinkRoute />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Toaster />
          <SonnerToaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
