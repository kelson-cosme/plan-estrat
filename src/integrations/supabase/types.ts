// src/integrations/supabase/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: {
          code: string
          created_at: string
          criticality: string | null
          id: string
          installation_date: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          criticality?: string | null
          id?: string
          installation_date?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          criticality?: string | null
          id?: string
          installation_date?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_plan_schedules: {
        Row: {
          created_at: string
          id: string
          last_generated_date: string | null
          maintenance_plan_id: string
          next_scheduled_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_generated_date?: string | null
          maintenance_plan_id: string
          next_scheduled_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_generated_date?: string | null
          maintenance_plan_id?: string
          next_scheduled_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_plan_schedules_maintenance_plan_id_fkey"
            columns: ["maintenance_plan_id"]
            isOneToOne: false
            referencedRelation: "maintenance_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_plans: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          equipment_id: string | null
          estimated_duration_hours: number | null
          frequency_days: number | null
          id: string
          name: string
          priority: string | null
          tasks: string | null // Assumindo que tasks é armazenado como JSON string (texto) ou text puro no DB
          type: string
          updated_at: string
          // NOVOS CAMPOS ADICIONADOS AQUI
          end_date: string | null // Adicionado: para a data de término do agendamento
          schedule_days_of_week: string | null // Adicionado: para os dias da semana (ex: '["monday", "friday"]') - armazenado como JSON string ou array de texto
          required_resources: string | null; // NOVO: Recursos necessários para o plano (JSON string)
          // FIM DOS NOVOS CAMPOS
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          estimated_duration_hours?: number | null
          frequency_days?: number | null
          id?: string
          name: string
          priority?: string | null
          tasks?: string | null
          type: string
          updated_at?: string
          // NOVOS CAMPOS ADICIONADOS AQUI
          end_date?: string | null
          schedule_days_of_week?: string | null
          required_resources?: string | null; // NOVO
          // FIM DOS NOVOS CAMPOS
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          estimated_duration_hours?: number | null
          frequency_days?: number | null
          id?: string
          name?: string
          priority?: string | null
          tasks?: string | null
          type?: string
          updated_at?: string
          // NOVOS CAMPOS ADICIONADOS AQUI
          end_date?: string | null
          schedule_days_of_week?: string | null
          required_resources?: string | null; // NOVO
          // FIM DOS NOVOS CAMPOS
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_plans_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string
          description: string | null
          equipment_id: string | null
          estimated_hours: number | null
          id: string
          maintenance_plan_id: string | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          title: string
          type: string
          updated_at: string
          used_resources: string | null; // NOVO: Recursos utilizados (JSON string)
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          estimated_hours?: number | null
          id?: string
          maintenance_plan_id?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string
          used_resources?: string | null; // NOVO
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          estimated_hours?: number | null
          id?: string
          maintenance_plan_id?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
          used_resources?: string | null; // NOVO
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_maintenance_plan_id_fkey"
            columns: ["maintenance_plan_id"]
            isOneToOne: false
            referencedRelation: "maintenance_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_scheduled_work_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      initialize_maintenance_schedules: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const;