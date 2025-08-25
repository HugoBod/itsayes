export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_members: {
        Row: {
          accepted_at: string | null
          account_id: string
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          role: Database["public"]["Enums"]["account_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["account_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["account_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          avatar_url: string | null
          billing_email: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          name: string
          slug: string | null
          storage_limit_gb: number | null
          subscription_end_date: string | null
          subscription_plan: string | null
          subscription_start_date: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string | null
          website_url: string | null
          workspace_limit: number | null
        }
        Insert: {
          avatar_url?: string | null
          billing_email?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          slug?: string | null
          storage_limit_gb?: number | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string | null
          website_url?: string | null
          workspace_limit?: number | null
        }
        Update: {
          avatar_url?: string | null
          billing_email?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          slug?: string | null
          storage_limit_gb?: number | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string | null
          website_url?: string | null
          workspace_limit?: number | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: Database["public"]["Enums"]["activity_type"]
          created_at: string | null
          details: Json | null
          id: string
          metadata: Json | null
          resource_id: string
          resource_type: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          details?: Json | null
          id?: string
          metadata?: Json | null
          resource_id: string
          resource_type: string
          user_id: string
          workspace_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          details?: Json | null
          id?: string
          metadata?: Json | null
          resource_id?: string
          resource_type?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          attachable_id: string
          attachable_type: string
          created_at: string | null
          file_path: string
          file_size: number
          filename: string
          id: string
          image_height: number | null
          image_width: number | null
          is_archived: boolean | null
          is_image: boolean | null
          mime_type: string
          original_filename: string
          processing_status: string | null
          updated_at: string | null
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          attachable_id: string
          attachable_type: string
          created_at?: string | null
          file_path: string
          file_size: number
          filename: string
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_archived?: boolean | null
          is_image?: boolean | null
          mime_type: string
          original_filename: string
          processing_status?: string | null
          updated_at?: string | null
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          attachable_id?: string
          attachable_type?: string
          created_at?: string | null
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_archived?: boolean | null
          is_image?: boolean | null
          mime_type?: string
          original_filename?: string
          processing_status?: string | null
          updated_at?: string | null
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_archived: boolean | null
          name: string
          position: number | null
          settings: Json | null
          type: Database["public"]["Enums"]["board_type"]
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          position?: number | null
          settings?: Json | null
          type: Database["public"]["Enums"]["board_type"]
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          position?: number | null
          settings?: Json | null
          type?: Database["public"]["Enums"]["board_type"]
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          content_type: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          is_archived: boolean | null
          is_edited: boolean | null
          item_id: string
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          content: string
          content_type?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_edited?: boolean | null
          item_id: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          content?: string
          content_type?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_edited?: boolean | null
          item_id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          assigned_to: string | null
          board_id: string
          created_at: string | null
          created_by: string
          data: Json
          due_date: string | null
          id: string
          is_archived: boolean | null
          parent_id: string | null
          position: number | null
          status: Database["public"]["Enums"]["item_status"] | null
          title: string
          type: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          board_id: string
          created_at?: string | null
          created_by: string
          data?: Json
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          parent_id?: string | null
          position?: number | null
          status?: Database["public"]["Enums"]["item_status"] | null
          title: string
          type: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          board_id?: string
          created_at?: string | null
          created_by?: string
          data?: Json
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          parent_id?: string | null
          position?: number | null
          status?: Database["public"]["Enums"]["item_status"] | null
          title?: string
          type?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      views: {
        Row: {
          board_id: string
          column_config: Json | null
          created_at: string | null
          display_settings: Json | null
          filters: Json | null
          id: string
          is_archived: boolean | null
          is_default: boolean | null
          name: string
          position: number | null
          sort_config: Json | null
          type: Database["public"]["Enums"]["view_type"]
          updated_at: string | null
        }
        Insert: {
          board_id: string
          column_config?: Json | null
          created_at?: string | null
          display_settings?: Json | null
          filters?: Json | null
          id?: string
          is_archived?: boolean | null
          is_default?: boolean | null
          name: string
          position?: number | null
          sort_config?: Json | null
          type?: Database["public"]["Enums"]["view_type"]
          updated_at?: string | null
        }
        Update: {
          board_id?: string
          column_config?: Json | null
          created_at?: string | null
          display_settings?: Json | null
          filters?: Json | null
          id?: string
          is_archived?: boolean | null
          is_default?: boolean | null
          name?: string
          position?: number | null
          sort_config?: Json | null
          type?: Database["public"]["Enums"]["view_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "views_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          accepted_at: string | null
          can_edit_budget: boolean | null
          can_edit_planning: boolean | null
          can_invite_others: boolean | null
          can_view_budget: boolean | null
          can_view_planning: boolean | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          last_accessed_at: string | null
          role: Database["public"]["Enums"]["workspace_role"]
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          can_edit_budget?: boolean | null
          can_edit_planning?: boolean | null
          can_invite_others?: boolean | null
          can_view_budget?: boolean | null
          can_view_planning?: boolean | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          role?: Database["public"]["Enums"]["workspace_role"]
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          can_edit_budget?: boolean | null
          can_edit_planning?: boolean | null
          can_invite_others?: boolean | null
          can_view_budget?: boolean | null
          can_view_planning?: boolean | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          role?: Database["public"]["Enums"]["workspace_role"]
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          account_id: string
          avatar_url: string | null
          color_scheme: string | null
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          invite_code: string | null
          is_archived: boolean | null
          is_public: boolean | null
          locale: string | null
          name: string
          onboarding_completed_at: string | null
          onboarding_data_couple: Json | null
          onboarding_data_planner: Json | null
          onboarding_migrated_at: string | null
          slug: string | null
          timezone: string | null
          updated_at: string | null
          venue_location: string | null
          venue_name: string | null
          wedding_date: string | null
        }
        Insert: {
          account_id: string
          avatar_url?: string | null
          color_scheme?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          is_archived?: boolean | null
          is_public?: boolean | null
          locale?: string | null
          name: string
          onboarding_completed_at?: string | null
          onboarding_data_couple?: Json | null
          onboarding_data_planner?: Json | null
          onboarding_migrated_at?: string | null
          slug?: string | null
          timezone?: string | null
          updated_at?: string | null
          venue_location?: string | null
          venue_name?: string | null
          wedding_date?: string | null
        }
        Update: {
          account_id?: string
          avatar_url?: string | null
          color_scheme?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          is_archived?: boolean | null
          is_public?: boolean | null
          locale?: string | null
          name?: string
          onboarding_completed_at?: string | null
          onboarding_data_couple?: Json | null
          onboarding_data_planner?: Json | null
          onboarding_migrated_at?: string | null
          slug?: string | null
          timezone?: string | null
          updated_at?: string | null
          venue_location?: string | null
          venue_name?: string | null
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_perform_action: {
        Args: {
          required_role: Database["public"]["Enums"]["workspace_role"]
          workspace_uuid: string
        }
        Returns: boolean
      }
      complete_onboarding: {
        Args: { workspace_uuid: string }
        Returns: boolean
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_default_workspace: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_workspace_stats: {
        Args: { workspace_uuid: string }
        Returns: Json
      }
      log_activity: {
        Args: {
          action_type: Database["public"]["Enums"]["activity_type"]
          details_param?: Json
          resource_id_param: string
          resource_type_param: string
          workspace_uuid: string
        }
        Returns: undefined
      }
      user_account_role: {
        Args: { account_uuid: string }
        Returns: Database["public"]["Enums"]["account_role"]
      }
      user_has_account_access: {
        Args: { account_uuid: string }
        Returns: boolean
      }
      user_has_workspace_access: {
        Args: { workspace_uuid: string }
        Returns: boolean
      }
      user_workspace_role: {
        Args: { workspace_uuid: string }
        Returns: Database["public"]["Enums"]["workspace_role"]
      }
    }
    Enums: {
      account_role: "owner" | "admin" | "member"
      account_type: "personal" | "team"
      activity_type:
        | "created"
        | "updated"
        | "deleted"
        | "commented"
        | "status_changed"
        | "assigned"
        | "completed"
      board_type: "budget" | "planning" | "custom"
      item_status: "draft" | "active" | "completed" | "archived"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
      view_type: "table" | "kanban" | "calendar" | "timeline"
      workspace_role: "owner" | "admin" | "editor" | "viewer"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_role: ["owner", "admin", "member"],
      account_type: ["personal", "team"],
      activity_type: [
        "created",
        "updated",
        "deleted",
        "commented",
        "status_changed",
        "assigned",
        "completed",
      ],
      board_type: ["budget", "planning", "custom"],
      item_status: ["draft", "active", "completed", "archived"],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "unpaid",
      ],
      view_type: ["table", "kanban", "calendar", "timeline"],
      workspace_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const

