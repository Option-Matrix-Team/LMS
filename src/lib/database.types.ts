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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string
          available_copies: number
          created_at: string | null
          description: string | null
          id: string
          isbn: string | null
          library_id: string
          location: string | null
          name: string
          search_vector: unknown
          thumbnail_url: string | null
          total_copies: number
        }
        Insert: {
          author: string
          available_copies?: number
          created_at?: string | null
          description?: string | null
          id?: string
          isbn?: string | null
          library_id: string
          location?: string | null
          name: string
          search_vector?: unknown
          thumbnail_url?: string | null
          total_copies?: number
        }
        Update: {
          author?: string
          available_copies?: number
          created_at?: string | null
          description?: string | null
          id?: string
          isbn?: string | null
          library_id?: string
          location?: string | null
          name?: string
          search_vector?: unknown
          thumbnail_url?: string | null
          total_copies?: number
        }
        Relationships: [
          {
            foreignKeyName: "books_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      borrowing_policies: {
        Row: {
          borrow_duration_days: number
          extension_duration_days: number
          id: string
          library_id: string
          max_books_per_member: number
        }
        Insert: {
          borrow_duration_days?: number
          extension_duration_days?: number
          id?: string
          library_id: string
          max_books_per_member?: number
        }
        Update: {
          borrow_duration_days?: number
          extension_duration_days?: number
          id?: string
          library_id?: string
          max_books_per_member?: number
        }
        Relationships: [
          {
            foreignKeyName: "borrowing_policies_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: true
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      borrowings: {
        Row: {
          book_id: string
          borrowed_at: string | null
          due_date: string
          extended_at: string | null
          id: string
          librarian_id: string
          member_id: string
          phone_at_borrow: string
          returned_at: string | null
        }
        Insert: {
          book_id: string
          borrowed_at?: string | null
          due_date: string
          extended_at?: string | null
          id?: string
          librarian_id: string
          member_id: string
          phone_at_borrow: string
          returned_at?: string | null
        }
        Update: {
          book_id?: string
          borrowed_at?: string | null
          due_date?: string
          extended_at?: string | null
          id?: string
          librarian_id?: string
          member_id?: string
          phone_at_borrow?: string
          returned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "borrowings_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrowings_librarian_id_fkey"
            columns: ["librarian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrowings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      libraries: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: string
          library_id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          id?: string
          library_id: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          id?: string
          library_id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          library_id: string | null
          name: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          library_id?: string | null
          name?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          library_id?: string | null
          name?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_book_copies: { Args: { book_id: string }; Returns: undefined }
      increment_book_copies: { Args: { book_id: string }; Returns: undefined }
      search_books: {
        Args: { lib_id: string; search_query: string }
        Returns: {
          author: string
          available_copies: number
          created_at: string
          description: string
          id: string
          isbn: string
          library_id: string
          location: string
          name: string
          rank: number
          thumbnail_url: string
          total_copies: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
