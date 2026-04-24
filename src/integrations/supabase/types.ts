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
      analytics_events: {
        Row: {
          created_at: string
          event_date: string
          event_type: string
          id: string
          metadata: Json
          subject: string | null
          user_id: string
          value_minutes: number
        }
        Insert: {
          created_at?: string
          event_date?: string
          event_type: string
          id?: string
          metadata?: Json
          subject?: string | null
          user_id: string
          value_minutes?: number
        }
        Update: {
          created_at?: string
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json
          subject?: string | null
          user_id?: string
          value_minutes?: number
        }
        Relationships: []
      }
      bible_progress: {
        Row: {
          created_at: string
          id: string
          last_modified: string
          plan_day: number
          prayer_completed: boolean
          progress_date: string
          reading_completed: boolean
          reading_portion: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_modified?: string
          plan_day: number
          prayer_completed?: boolean
          progress_date?: string
          reading_completed?: boolean
          reading_portion: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_modified?: string
          plan_day?: number
          prayer_completed?: boolean
          progress_date?: string
          reading_completed?: boolean
          reading_portion?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_links: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          requester_id: string
          share_progress: boolean
          share_timetable: boolean
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          requester_id: string
          share_progress?: boolean
          share_timetable?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          requester_id?: string
          share_progress?: boolean
          share_timetable?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          daily_goal_minutes: number
          display_name: string
          exam_date: string | null
          exam_name: string
          id: string
          mentor_tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_goal_minutes?: number
          display_name?: string
          exam_date?: string | null
          exam_name?: string
          id?: string
          mentor_tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_goal_minutes?: number
          display_name?: string
          exam_date?: string | null
          exam_name?: string
          id?: string
          mentor_tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          label: string
          last_modified: string
          reminder_time: string | null
          reminder_type: string
          repeat_minutes: number | null
          updated_at: string
          user_id: string
          voice_enabled: boolean
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          label: string
          last_modified?: string
          reminder_time?: string | null
          reminder_type: string
          repeat_minutes?: number | null
          updated_at?: string
          user_id: string
          voice_enabled?: boolean
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          last_modified?: string
          reminder_time?: string | null
          reminder_type?: string
          repeat_minutes?: number | null
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean
        }
        Relationships: []
      }
      study_notes: {
        Row: {
          content: string
          created_at: string
          encrypted_payload: string | null
          id: string
          is_protected: boolean
          is_revision: boolean
          last_modified: string
          subject: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          encrypted_payload?: string | null
          id?: string
          is_protected?: boolean
          is_revision?: boolean
          last_modified?: string
          subject: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          encrypted_payload?: string | null
          id?: string
          is_protected?: boolean
          is_revision?: boolean
          last_modified?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_schedules: {
        Row: {
          color_token: string
          created_at: string
          end_time: string
          id: string
          last_modified: string
          notes: string | null
          priority: string
          schedule_date: string
          sort_order: number
          start_time: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color_token?: string
          created_at?: string
          end_time: string
          id?: string
          last_modified?: string
          notes?: string | null
          priority?: string
          schedule_date: string
          sort_order?: number
          start_time: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color_token?: string
          created_at?: string
          end_time?: string
          id?: string
          last_modified?: string
          notes?: string | null
          priority?: string
          schedule_date?: string
          sort_order?: number
          start_time?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          estimated_minutes: number
          id: string
          last_modified: string
          priority: string
          status: string
          streak_day: string | null
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          last_modified?: string
          priority?: string
          status?: string
          streak_day?: string | null
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          last_modified?: string
          priority?: string
          status?: string
          streak_day?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      timer_sessions: {
        Row: {
          break_minutes: number
          created_at: string
          ended_at: string | null
          focused_minutes: number
          id: string
          mode: string
          planned_minutes: number
          started_at: string
          strict_mode: boolean
          subject: string | null
          user_id: string
        }
        Insert: {
          break_minutes?: number
          created_at?: string
          ended_at?: string | null
          focused_minutes?: number
          id?: string
          mode: string
          planned_minutes: number
          started_at?: string
          strict_mode?: boolean
          subject?: string | null
          user_id: string
        }
        Update: {
          break_minutes?: number
          created_at?: string
          ended_at?: string | null
          focused_minutes?: number
          id?: string
          mode?: string
          planned_minutes?: number
          started_at?: string
          strict_mode?: boolean
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vault_items: {
        Row: {
          created_at: string
          encrypted_payload: string
          hint: string | null
          id: string
          last_modified: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_payload: string
          hint?: string | null
          id?: string
          last_modified?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_payload?: string
          hint?: string | null
          id?: string
          last_modified?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
