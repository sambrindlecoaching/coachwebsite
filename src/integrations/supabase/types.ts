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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          added_at: string
          email: string
        }
        Insert: {
          added_at?: string
          email: string
        }
        Update: {
          added_at?: string
          email?: string
        }
        Relationships: []
      }
      book_chapters: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          number: number
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          number?: number
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          number?: number
          status?: string
          title?: string
        }
        Relationships: []
      }
      client_documents: {
        Row: {
          client_id: string
          edited: Json
          last_source: string | null
          sections: Json
          updated_at: string
        }
        Insert: {
          client_id: string
          edited?: Json
          last_source?: string | null
          sections?: Json
          updated_at?: string
        }
        Update: {
          client_id?: string
          edited?: Json
          last_source?: string | null
          sections?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_events: {
        Row: {
          client_id: string
          detail: string | null
          id: string
          kind: string
          link: string | null
          occurred_at: string
          summary: string
        }
        Insert: {
          client_id: string
          detail?: string | null
          id?: string
          kind: string
          link?: string | null
          occurred_at?: string
          summary: string
        }
        Update: {
          client_id?: string
          detail?: string | null
          id?: string
          kind?: string
          link?: string | null
          occurred_at?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          love_stage: string
          name: string
          next_session: string | null
          notes: string | null
          programme: string
          progress_notes: string | null
          recap_enabled: boolean
          recording_consent: boolean
          recording_consent_at: string | null
          start_date: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          love_stage?: string
          name: string
          next_session?: string | null
          notes?: string | null
          programme?: string
          progress_notes?: string | null
          recap_enabled?: boolean
          recording_consent?: boolean
          recording_consent_at?: string | null
          start_date?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          love_stage?: string
          name?: string
          next_session?: string | null
          notes?: string | null
          programme?: string
          progress_notes?: string | null
          recap_enabled?: boolean
          recording_consent?: boolean
          recording_consent_at?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
      content_pieces: {
        Row: {
          brief: string | null
          channel: string | null
          chapter_id: string | null
          created_at: string
          door: string
          draft: string | null
          format: string | null
          id: string
          my_take: string | null
          origin: string
          photo_url: string | null
          scheduled_for: string | null
          signal: string | null
          sources: Json
          status: string
          suggested_format: string | null
          title: string
        }
        Insert: {
          brief?: string | null
          channel?: string | null
          chapter_id?: string | null
          created_at?: string
          door?: string
          draft?: string | null
          format?: string | null
          id?: string
          my_take?: string | null
          origin?: string
          photo_url?: string | null
          scheduled_for?: string | null
          signal?: string | null
          sources?: Json
          status?: string
          suggested_format?: string | null
          title: string
        }
        Update: {
          brief?: string | null
          channel?: string | null
          chapter_id?: string | null
          created_at?: string
          door?: string
          draft?: string | null
          format?: string | null
          id?: string
          my_take?: string | null
          origin?: string
          photo_url?: string | null
          scheduled_for?: string | null
          signal?: string | null
          sources?: Json
          status?: string
          suggested_format?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_pieces_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          consent: boolean
          consent_at: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          message: string | null
          notes: string | null
          resource: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          consent?: boolean
          consent_at?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          message?: string | null
          notes?: string | null
          resource?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          consent?: boolean
          consent_at?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          message?: string | null
          notes?: string | null
          resource?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: string
          created_at: string
          id: string
          source: string
          storage_path: string | null
          tags: string[]
          url: string
          used_in: string[]
        }
        Insert: {
          alt?: string
          created_at?: string
          id?: string
          source?: string
          storage_path?: string | null
          tags?: string[]
          url: string
          used_in?: string[]
        }
        Update: {
          alt?: string
          created_at?: string
          id?: string
          source?: string
          storage_path?: string | null
          tags?: string[]
          url?: string
          used_in?: string[]
        }
        Relationships: []
      }
      milestones: {
        Row: {
          client_id: string | null
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          phase: number | null
          sort_order: number
          title: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          phase?: number | null
          sort_order?: number
          title: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          phase?: number | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach: {
        Row: {
          created_at: string
          handle: string | null
          id: string
          kind: string
          note: string | null
          platform: string | null
        }
        Insert: {
          created_at?: string
          handle?: string | null
          id?: string
          kind: string
          note?: string | null
          platform?: string | null
        }
        Update: {
          created_at?: string
          handle?: string | null
          id?: string
          kind?: string
          note?: string | null
          platform?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          referrals_sent: number
          type: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          referrals_sent?: number
          type?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          referrals_sent?: number
          type?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          month_number: number
          paid: boolean
        }
        Insert: {
          amount?: number
          client_id: string
          created_at?: string
          id?: string
          month_number: number
          paid?: boolean
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          month_number?: number
          paid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_responses: {
        Row: {
          answer: string
          created_at: string
          id: string
          issue: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          issue: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          issue?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          door: string | null
          id: string
          kind: string
          name: string
          price_cents: number | null
          price_label: string | null
          slug: string
          sort_order: number
          status: string
          stripe_price_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          door?: string | null
          id?: string
          kind?: string
          name: string
          price_cents?: number | null
          price_label?: string | null
          slug: string
          sort_order?: number
          status?: string
          stripe_price_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          door?: string | null
          id?: string
          kind?: string
          name?: string
          price_cents?: number | null
          price_label?: string | null
          slug?: string
          sort_order?: number
          status?: string
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      progress_letters: {
        Row: {
          client_id: string
          created_at: string
          draft: string
          id: string
          stage: string
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          draft?: string
          id?: string
          stage: string
          status?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          draft?: string
          id?: string
          stage?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_letters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          answers: Json
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          result: string | null
          score: number
        }
        Insert: {
          answers?: Json
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          result?: string | null
          score?: number
        }
        Update: {
          answers?: Json
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          result?: string | null
          score?: number
        }
        Relationships: []
      }
      session_summaries: {
        Row: {
          breakthroughs: string | null
          client_id: string
          created_at: string
          email_draft: string | null
          email_status: string
          id: string
          recording_path: string | null
          session_number: number | null
          themes: string | null
          transcript: string | null
          work_on: string | null
        }
        Insert: {
          breakthroughs?: string | null
          client_id: string
          created_at?: string
          email_draft?: string | null
          email_status?: string
          id?: string
          recording_path?: string | null
          session_number?: number | null
          themes?: string | null
          transcript?: string | null
          work_on?: string | null
        }
        Update: {
          breakthroughs?: string | null
          client_id?: string
          created_at?: string
          email_draft?: string | null
          email_status?: string
          id?: string
          recording_path?: string | null
          session_number?: number | null
          themes?: string | null
          transcript?: string | null
          work_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_summaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_id: string
          created_at: string
          done: boolean
          id: string
          notes: string | null
          session_date: string | null
          session_number: number
        }
        Insert: {
          client_id: string
          created_at?: string
          done?: boolean
          id?: string
          notes?: string | null
          session_date?: string | null
          session_number: number
        }
        Update: {
          client_id?: string
          created_at?: string
          done?: boolean
          id?: string
          notes?: string | null
          session_date?: string | null
          session_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          client_id: string | null
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          source: string
          title: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          source?: string
          title: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          source?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_notes: {
        Row: {
          audio_url: string | null
          created_at: string
          door: string
          duration_seconds: number
          id: string
          is_free: boolean
          published: boolean
          situation: string | null
          sort_order: number
          stage: string
          title: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          door?: string
          duration_seconds?: number
          id?: string
          is_free?: boolean
          published?: boolean
          situation?: string | null
          sort_order?: number
          stage: string
          title: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          door?: string
          duration_seconds?: number
          id?: string
          is_free?: boolean
          published?: boolean
          situation?: string | null
          sort_order?: number
          stage?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sync_admin_role: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
