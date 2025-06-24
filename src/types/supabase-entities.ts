
// Centralized type definitions for Supabase entities
export interface Salon {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  plan: 'bronze' | 'prata' | 'gold';
  notification_sound?: string;
  street_number?: string;
  city?: string;
  state?: string;
  contact_phone?: string;
  opening_hours?: any;
  is_open?: boolean;
  setup_completed?: boolean;
  admin_setup_completed?: boolean;
  banner_image_url?: string;
  max_attendants?: number;
  unique_slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  active: boolean;
}

// Agora Client representa os dados da tabela client_auth unificada
export interface Client {
  id: string;
  username: string;
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  password_hash?: string;
  full_name?: string;
  address?: string;
  street_address?: string;
  house_number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  client_auth_id: string; // Atualizado para usar client_auth_id
  service_id: string;
  user_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Relations
  salon?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
  client?: {
    id: string;
    username: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface AdminUser {
  id: string;
  salon_id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  avatar_url?: string;
}

export interface SalonUser {
  id: string;
  salon_id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  is_owner: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PresetService {
  id: string;
  category: string;
  name: string;
  description?: string;
  default_duration_minutes: number;
}

export interface PlanConfiguration {
  id: string;
  plan_type: string;
  name: string;
  price: number;
  description?: string;
  max_attendants?: number;
  max_appointments?: number;
  max_users?: number;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  totalSalons?: number;
  totalServices?: number;
  salonsByPlan?: {
    bronze: number;
    prata: number;
    gold: number;
  };
  expectedRevenue?: {
    total: number;
    bronze: number;
    prata: number;
    gold: number;
  };
}
