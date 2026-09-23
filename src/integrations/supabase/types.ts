export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          availability: string
          company_id: string | null
          created_at: string
          freelance_id: string
          freelance_user_id: string | null
          id: string
          mission_id: string
          mission_title: string
          pitch: string
          rate: number
          status: string
        }
        Insert: {
          availability?: string
          company_id?: string | null
          created_at?: string
          freelance_id: string
          freelance_user_id?: string | null
          id?: string
          mission_id: string
          mission_title?: string
          pitch?: string
          rate?: number
          status?: string
        }
        Update: {
          availability?: string
          company_id?: string | null
          created_at?: string
          freelance_id?: string
          freelance_user_id?: string | null
          id?: string
          mission_id?: string
          mission_title?: string
          pitch?: string
          rate?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_freelance_id_fkey"
            columns: ["freelance_id"]
            isOneToOne: false
            referencedRelation: "freelance_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_profiles: {
        Row: {
          available: boolean
          bio: string
          city: string
          created_at: string
          experience_years: number
          id: string
          initials: string
          missions_count: number
          name: string
          onboarded: boolean
          portfolio: Json
          rate: number
          rating: number
          reviews: number
          skills: string[]
          testimonials: Json
          title: string
          user_id: string | null
        }
        Insert: {
          available?: boolean
          bio?: string
          city?: string
          created_at?: string
          experience_years?: number
          id: string
          initials?: string
          missions_count?: number
          name: string
          onboarded?: boolean
          portfolio?: Json
          rate?: number
          rating?: number
          reviews?: number
          skills?: string[]
          testimonials?: Json
          title?: string
          user_id?: string | null
        }
        Update: {
          available?: boolean
          bio?: string
          city?: string
          created_at?: string
          experience_years?: number
          id?: string
          initials?: string
          missions_count?: number
          name?: string
          onboarded?: boolean
          portfolio?: Json
          rate?: number
          rating?: number
          reviews?: number
          skills?: string[]
          testimonials?: Json
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      interviews: {
        Row: {
          channel: string
          company_id: string
          created_at: string
          day: string
          duration: string
          freelance_id: string
          freelance_user_id: string | null
          id: string
          subject: string
          time: string
        }
        Insert: {
          channel?: string
          company_id: string
          created_at?: string
          day: string
          duration?: string
          freelance_id: string
          freelance_user_id?: string | null
          id?: string
          subject?: string
          time?: string
        }
        Update: {
          channel?: string
          company_id?: string
          created_at?: string
          day?: string
          duration?: string
          freelance_id?: string
          freelance_user_id?: string | null
          id?: string
          subject?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_freelance_id_fkey"
            columns: ["freelance_id"]
            isOneToOne: false
            referencedRelation: "freelance_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          company_id: string | null
          created_at: string
          freelance_id: string
          freelance_user_id: string | null
          id: string
          sender: string
          subject: string
        }
        Insert: {
          body: string
          company_id?: string | null
          created_at?: string
          freelance_id: string
          freelance_user_id?: string | null
          id?: string
          sender: string
          subject?: string
        }
        Update: {
          body?: string
          company_id?: string | null
          created_at?: string
          freelance_id?: string
          freelance_user_id?: string | null
          id?: string
          sender?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_freelance_id_fkey"
            columns: ["freelance_id"]
            isOneToOne: false
            referencedRelation: "freelance_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          applicants: number
          budget: number
          category: string
          company: string
          created_at: string
          deliverables: string[]
          description: string
          duration: string
          freelance_id: string | null
          id: string
          owner_id: string | null
          paused: boolean
          posted_at: string
          progress: number
          recommended: string[]
          skills: string[]
          status: string
          summary: string
          team: string
          title: string
        }
        Insert: {
          applicants?: number
          budget?: number
          category?: string
          company?: string
          created_at?: string
          deliverables?: string[]
          description?: string
          duration?: string
          freelance_id?: string | null
          id: string
          owner_id?: string | null
          paused?: boolean
          posted_at?: string
          progress?: number
          recommended?: string[]
          skills?: string[]
          status?: string
          summary?: string
          team?: string
          title: string
        }
        Update: {
          applicants?: number
          budget?: number
          category?: string
          company?: string
          created_at?: string
          deliverables?: string[]
          description?: string
          duration?: string
          freelance_id?: string | null
          id?: string
          owner_id?: string | null
          paused?: boolean
          posted_at?: string
          progress?: number
          recommended?: string[]
          skills?: string[]
          status?: string
          summary?: string
          team?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_freelance_id_fkey"
            columns: ["freelance_id"]
            isOneToOne: false
            referencedRelation: "freelance_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          detail: string
          freelance_id: string | null
          id: string
          kind: string
          read: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: string
          freelance_id?: string | null
          id?: string
          kind?: string
          read?: boolean
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: string
          freelance_id?: string | null
          id?: string
          kind?: string
          read?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_freelance_id_fkey"
            columns: ["freelance_id"]
            isOneToOne: false
            referencedRelation: "freelance_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string | null
          counterpart: string
          created_at: string
          due_label: string
          freelance_id: string | null
          freelance_user_id: string | null
          id: string
          label: string
          mission_id: string | null
          state: string
        }
        Insert: {
          amount?: number
          company_id?: string | null
          counterpart?: string
          created_at?: string
          due_label?: string
          freelance_id?: string | null
          freelance_user_id?: string | null
          id?: string
          label?: string
          mission_id?: string | null
          state?: string
        }
        Update: {
          amount?: number
          company_id?: string | null
          counterpart?: string
          created_at?: string
          due_label?: string
          freelance_id?: string | null
          freelance_user_id?: string | null
          id?: string
          label?: string
          mission_id?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_freelance_id_fkey"
            columns: ["freelance_id"]
            isOneToOne: false
            referencedRelation: "freelance_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["account_role"]
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          role?: Database["public"]["Enums"]["account_role"]
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["account_role"]
        }
        Relationships: []
      }
      saved_alerts: {
        Row: {
          created_at: string
          criteria: Json
          id: string
          known_ids: string[]
          label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          id?: string
          known_ids?: string[]
          label?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          id?: string
          known_ids?: string[]
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      shortlist: {
        Row: {
          created_at: string
          freelance_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          freelance_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          freelance_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlist_freelance_id_fkey"
            columns: ["freelance_id"]
            isOneToOne: false
            referencedRelation: "freelance_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_role: "entreprise" | "freelance"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_role: ["entreprise", "freelance"],
    },
  },
} as const
