export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_auth: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          hierarchy_level: string | null
          id: string
          name: string
          password: string
          password_hash: string | null
          phone: string | null
          role: string
          salon_code: string | null
          salon_id: string | null
          super_admin_link_code: string | null
          unique_admin_code: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          hierarchy_level?: string | null
          id?: string
          name: string
          password: string
          password_hash?: string | null
          phone?: string | null
          role?: string
          salon_code?: string | null
          salon_id?: string | null
          super_admin_link_code?: string | null
          unique_admin_code?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          hierarchy_level?: string | null
          id?: string
          name?: string
          password?: string
          password_hash?: string | null
          phone?: string | null
          role?: string
          salon_code?: string | null
          salon_id?: string | null
          super_admin_link_code?: string | null
          unique_admin_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_auth_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_hierarchy: {
        Row: {
          admin_code: string
          admin_id: string | null
          created_at: string | null
          id: string
          salon_code: string
          salon_id: string | null
          super_admin_code: string
          updated_at: string | null
        }
        Insert: {
          admin_code: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          salon_code: string
          salon_id?: string | null
          super_admin_code: string
          updated_at?: string | null
        }
        Update: {
          admin_code?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          salon_code?: string
          salon_id?: string | null
          super_admin_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_hierarchy_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_auth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_hierarchy_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          client_auth_id: string
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          salon_id: string
          service_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          client_auth_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          salon_id: string
          service_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          client_auth_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          salon_id?: string
          service_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_auth_id_fkey"
            columns: ["client_auth_id"]
            isOneToOne: false
            referencedRelation: "client_auth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_auth: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          house_number: string | null
          id: string
          name: string
          neighborhood: string | null
          password: string
          password_hash: string | null
          phone: string | null
          state: string | null
          street_address: string | null
          updated_at: string
          username: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          house_number?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          password: string
          password_hash?: string | null
          phone?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          username: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          house_number?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          password?: string
          password_hash?: string | null
          phone?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          username?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      plan_configurations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_appointments: number | null
          max_attendants: number | null
          max_users: number | null
          name: string
          plan_type: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_appointments?: number | null
          max_attendants?: number | null
          max_users?: number | null
          name: string
          plan_type: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_appointments?: number | null
          max_attendants?: number | null
          max_users?: number | null
          name?: string
          plan_type?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      plan_upgrade_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          current_plan: string
          id: string
          justification: string
          requested_at: string
          requested_plan: string
          reviewed_at: string | null
          reviewed_by: string | null
          salon_id: string
          salon_name: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          current_plan: string
          id?: string
          justification: string
          requested_at?: string
          requested_plan: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          salon_id: string
          salon_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          current_plan?: string
          id?: string
          justification?: string
          requested_at?: string
          requested_plan?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          salon_id?: string
          salon_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      preset_services: {
        Row: {
          category: string
          created_at: string
          default_duration_minutes: number
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_duration_minutes?: number
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_duration_minutes?: number
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      salon_users: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          is_owner: boolean
          name: string
          phone: string | null
          role: string
          salon_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          is_owner?: boolean
          name: string
          phone?: string | null
          role?: string
          salon_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          is_owner?: boolean
          name?: string
          phone?: string | null
          role?: string
          salon_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      salons: {
        Row: {
          address: string
          admin_setup_completed: boolean | null
          banner_image_url: string | null
          city: string | null
          contact_phone: string | null
          created_at: string
          created_by_super_admin: boolean | null
          id: string
          is_open: boolean | null
          max_attendants: number | null
          name: string
          notification_sound: string | null
          opening_hours: Json | null
          owner_name: string
          phone: string
          plan: string
          setup_completed: boolean | null
          state: string | null
          street_number: string | null
          super_admin_code: string | null
          unique_code: string | null
          unique_slug: string | null
          updated_at: string
        }
        Insert: {
          address: string
          admin_setup_completed?: boolean | null
          banner_image_url?: string | null
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by_super_admin?: boolean | null
          id?: string
          is_open?: boolean | null
          max_attendants?: number | null
          name: string
          notification_sound?: string | null
          opening_hours?: Json | null
          owner_name: string
          phone: string
          plan?: string
          setup_completed?: boolean | null
          state?: string | null
          street_number?: string | null
          super_admin_code?: string | null
          unique_code?: string | null
          unique_slug?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          admin_setup_completed?: boolean | null
          banner_image_url?: string | null
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by_super_admin?: boolean | null
          id?: string
          is_open?: boolean | null
          max_attendants?: number | null
          name?: string
          notification_sound?: string | null
          opening_hours?: Json | null
          owner_name?: string
          phone?: string
          plan?: string
          setup_completed?: boolean | null
          state?: string | null
          street_number?: string | null
          super_admin_code?: string | null
          unique_code?: string | null
          unique_slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
          price: number
          salon_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name: string
          price: number
          salon_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          price?: number
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      system_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          salon_id: string | null
          title: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          salon_id?: string | null
          title: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          salon_id?: string | null
          title?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          salon_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: string
          salon_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          salon_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_incomplete_salons: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_salons_without_admins: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_admin_hierarchy_link: {
        Args: {
          p_salon_id: string
          p_admin_id: string
          p_salon_name: string
          p_admin_name: string
        }
        Returns: Json
      }
      create_plan_upgrade_request: {
        Args: {
          p_salon_id: string
          p_salon_name: string
          p_current_plan: string
          p_requested_plan: string
          p_justification: string
        }
        Returns: string
      }
      generate_unique_code: {
        Args: { prefix: string; length?: number }
        Returns: string
      }
      generate_unique_slug: {
        Args: { salon_name: string }
        Returns: string
      }
      get_available_time_slots: {
        Args: { p_salon_id: string; p_date: string; p_service_id?: string }
        Returns: {
          time_slot: string
        }[]
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      log_system_activity: {
        Args: {
          p_activity_type: string
          p_entity_type: string
          p_entity_id?: string
          p_user_id?: string
          p_salon_id?: string
          p_title?: string
          p_description?: string
          p_metadata?: Json
        }
        Returns: string
      }
      verify_password: {
        Args: { password: string; hash: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
