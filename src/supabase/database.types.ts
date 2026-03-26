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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          agent_id: string
          assigned_campaign: string | null
          created_at: string
          email: string | null
          first_name: string
          heat_index: Database["public"]["Enums"]["heat_index"] | null
          id: string
          last_message: string | null
          last_message_at: string | null
          last_name: string
          notes: string | null
          organization_id: string
          phone: string | null
          role: Database["public"]["Enums"]["lead_type"] | null
          sms_opt_in: boolean | null
          status: Database["public"]["Enums"]["lead_status"]
          type: Database["public"]["Enums"]["lead_type"] | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          assigned_campaign?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          heat_index?: Database["public"]["Enums"]["heat_index"] | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          last_name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["lead_type"] | null
          sms_opt_in?: boolean | null
          status?: Database["public"]["Enums"]["lead_status"]
          type?: Database["public"]["Enums"]["lead_type"] | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          assigned_campaign?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          heat_index?: Database["public"]["Enums"]["heat_index"] | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          last_name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["lead_type"] | null
          sms_opt_in?: boolean | null
          status?: Database["public"]["Enums"]["lead_status"]
          type?: Database["public"]["Enums"]["lead_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          agent_id: string
          asset_type: Database["public"]["Enums"]["media_asset_type"]
          created_at: string
          id: string
          organization_id: string
          property_id: string | null
          storage_path: string
        }
        Insert: {
          agent_id: string
          asset_type: Database["public"]["Enums"]["media_asset_type"]
          created_at?: string
          id?: string
          organization_id: string
          property_id?: string | null
          storage_path: string
        }
        Update: {
          agent_id?: string
          asset_type?: Database["public"]["Enums"]["media_asset_type"]
          created_at?: string
          id?: string
          organization_id?: string
          property_id?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          a2p_address: string | null
          a2p_business_type: string | null
          a2p_campaign_description: string | null
          a2p_ein: string | null
          a2p_industry: string | null
          a2p_legal_name: string | null
          a2p_sample_message_1: string | null
          a2p_sample_message_2: string | null
          a2p_sms_consent: boolean | null
          a2p_status: string
          a2p_website: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          brand_typography: string | null
          brand_visual_dna: string | null
          commission_split: number | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          a2p_address?: string | null
          a2p_business_type?: string | null
          a2p_campaign_description?: string | null
          a2p_ein?: string | null
          a2p_industry?: string | null
          a2p_legal_name?: string | null
          a2p_sample_message_1?: string | null
          a2p_sample_message_2?: string | null
          a2p_sms_consent?: boolean | null
          a2p_status?: string
          a2p_website?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          brand_typography?: string | null
          brand_visual_dna?: string | null
          commission_split?: number | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          a2p_address?: string | null
          a2p_business_type?: string | null
          a2p_campaign_description?: string | null
          a2p_ein?: string | null
          a2p_industry?: string | null
          a2p_legal_name?: string | null
          a2p_sample_message_1?: string | null
          a2p_sample_message_2?: string | null
          a2p_sms_consent?: boolean | null
          a2p_status?: string
          a2p_website?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          brand_typography?: string | null
          brand_visual_dna?: string | null
          commission_split?: number | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          a2p_address: string | null
          a2p_legal_name: string | null
          avatar_url: string | null
          bio: string | null
          buffer_access_token: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          license_number: string | null
          organization_id: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          a2p_address?: string | null
          a2p_legal_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          buffer_access_token?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          license_number?: string | null
          organization_id?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          a2p_address?: string | null
          a2p_legal_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          buffer_access_token?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          license_number?: string | null
          organization_id?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_line1: string | null
          agent_id: string
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          lot_size: string | null
          mls_data: Json | null
          organization_id: string
          price: number | null
          sq_ft: number | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"]
          thumbnail_url: string | null
          updated_at: string
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          agent_id: string
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          lot_size?: string | null
          mls_data?: Json | null
          organization_id: string
          price?: number | null
          sq_ft?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          thumbnail_url?: string | null
          updated_at?: string
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          agent_id?: string
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          lot_size?: string | null
          mls_data?: Json | null
          organization_id?: string
          price?: number | null
          sq_ft?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          thumbnail_url?: string | null
          updated_at?: string
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          property_id: string
          sort_order: number
          storage_path: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          sort_order?: number
          storage_path?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          sort_order?: number
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_marketing_posts: {
        Row: {
          agent_id: string | null
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          motion_assets: Json | null
          platforms: string[]
          property_id: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          motion_assets?: Json | null
          platforms: string[]
          property_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          motion_assets?: Json | null
          platforms?: string[]
          property_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_marketing_posts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_marketing_posts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_documents: {
        Row: {
          created_at: string | null
          document_url: string | null
          id: string
          sort_order: number | null
          status: Database["public"]["Enums"]["milestone_status"] | null
          title: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["milestone_status"] | null
          title: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["milestone_status"] | null
          title?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_documents_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_milestones: {
        Row: {
          created_at: string
          document_url: string | null
          due_date: string
          id: string
          sort_order: number
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          due_date: string
          id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          due_date?: string
          id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_milestones_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          agent_deduction: number | null
          agent_id: string
          commission_amount: number | null
          commission_percentage: number | null
          contract_acceptance_date: string | null
          created_at: string
          escrow_company_name: string | null
          escrow_number: string | null
          escrow_officer_email: string | null
          escrow_officer_name: string | null
          escrow_officer_phone: string | null
          id: string
          is_ai_active: boolean | null
          opening_date: string | null
          organization_id: string
          other_agent_email: string | null
          other_agent_name: string | null
          other_agent_phone: string | null
          property_id: string
          purchase_price: number | null
          representation: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
        }
        Insert: {
          agent_deduction?: number | null
          agent_id: string
          commission_amount?: number | null
          commission_percentage?: number | null
          contract_acceptance_date?: string | null
          created_at?: string
          escrow_company_name?: string | null
          escrow_number?: string | null
          escrow_officer_email?: string | null
          escrow_officer_name?: string | null
          escrow_officer_phone?: string | null
          id?: string
          is_ai_active?: boolean | null
          opening_date?: string | null
          organization_id: string
          other_agent_email?: string | null
          other_agent_name?: string | null
          other_agent_phone?: string | null
          property_id: string
          purchase_price?: number | null
          representation?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Update: {
          agent_deduction?: number | null
          agent_id?: string
          commission_amount?: number | null
          commission_percentage?: number | null
          contract_acceptance_date?: string | null
          created_at?: string
          escrow_company_name?: string | null
          escrow_number?: string | null
          escrow_officer_email?: string | null
          escrow_officer_name?: string | null
          escrow_officer_phone?: string | null
          id?: string
          is_ai_active?: boolean | null
          opening_date?: string | null
          organization_id?: string
          other_agent_email?: string | null
          other_agent_name?: string | null
          other_agent_phone?: string | null
          property_id?: string
          purchase_price?: number | null
          representation?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_org_and_link_profile: {
        Args: { p_name: string; p_subscription_tier: string }
        Returns: string
      }
      current_user_org_id: { Args: never; Returns: string }
      get_agent_public_profile: { Args: { p_agent_id: string }; Returns: Json }
      get_property_public: { Args: { p_property_id: string }; Returns: Json }
      is_user_broker: { Args: never; Returns: boolean }
      submit_agent_lead: {
        Args: {
          p_agent_id: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_org_id: string
          p_phone: string
          p_sms_consent: boolean
        }
        Returns: string
      }
    }
    Enums: {
      heat_index: "HOT" | "WARM" | "COLD"
      lead_status:
        | "NEW"
        | "CONTACTED"
        | "QUALIFIED"
        | "NEGOTIATING"
        | "CLOSED_WON"
        | "CLOSED_LOST"
      lead_type: "BUYER" | "SELLER" | "AGENT"
      media_asset_type: "IMAGE" | "VIDEO"
      milestone_status: "pending" | "active" | "completed"
      property_status:
        | "ACTIVE"
        | "PENDING"
        | "SOLD"
        | "WITHDRAWN"
        | "CANCELLED"
        | "DRAFT"
      transaction_status: "OPEN" | "ESCROW" | "CLOSED" | "CANCELLED"
      user_role: "BROKER" | "AGENT"
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
    Enums: {
      heat_index: ["HOT", "WARM", "COLD"],
      lead_status: [
        "NEW",
        "CONTACTED",
        "QUALIFIED",
        "NEGOTIATING",
        "CLOSED_WON",
        "CLOSED_LOST",
      ],
      lead_type: ["BUYER", "SELLER", "AGENT"],
      media_asset_type: ["IMAGE", "VIDEO"],
      milestone_status: ["pending", "active", "completed"],
      property_status: [
        "ACTIVE",
        "PENDING",
        "SOLD",
        "WITHDRAWN",
        "CANCELLED",
        "DRAFT",
      ],
      transaction_status: ["OPEN", "ESCROW", "CLOSED", "CANCELLED"],
      user_role: ["BROKER", "AGENT"],
    },
  },
} as const
