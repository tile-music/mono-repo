export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  prod: {
    Tables: {
      album_art: {
        Row: {
          "1200": string | null
          "250": string | null
          "500": string | null
          large: string | null
          mbid: string
          small: string | null
          source: string
          type: string
        }
        Insert: {
          "1200"?: string | null
          "250"?: string | null
          "500"?: string | null
          large?: string | null
          mbid: string
          small?: string | null
          source: string
          type: string
        }
        Update: {
          "1200"?: string | null
          "250"?: string | null
          "500"?: string | null
          large?: string | null
          mbid?: string
          small?: string | null
          source?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "mbid_ref"
            columns: ["mbid"]
            isOneToOne: false
            referencedRelation: "album_mbids"
            referencedColumns: ["mbid"]
          },
        ]
      }
      album_mbids: {
        Row: {
          album_id: number
          mbid: string
          score: number | null
          type: string
          updated_at: number
        }
        Insert: {
          album_id: number
          mbid: string
          score?: number | null
          type: string
          updated_at: number
        }
        Update: {
          album_id?: number
          mbid?: string
          score?: number | null
          type?: string
          updated_at?: number
        }
        Relationships: [
          {
            foreignKeyName: "album_mbid_key"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["album_id"]
          },
        ]
      }
      albums: {
        Row: {
          album_id: number
          album_name: string | null
          album_type: string | null
          artists: string[] | null
          ean: string | null
          genre: string[] | null
          image: string | null
          num_dics: number | null
          num_tracks: number | null
          release_day: number | null
          release_month: number | null
          release_year: number | null
          spotify_id: string | null
          upc: string | null
        }
        Insert: {
          album_id?: number
          album_name?: string | null
          album_type?: string | null
          artists?: string[] | null
          ean?: string | null
          genre?: string[] | null
          image?: string | null
          num_dics?: number | null
          num_tracks?: number | null
          release_day?: number | null
          release_month?: number | null
          release_year?: number | null
          spotify_id?: string | null
          upc?: string | null
        }
        Update: {
          album_id?: number
          album_name?: string | null
          album_type?: string | null
          artists?: string[] | null
          ean?: string | null
          genre?: string[] | null
          image?: string | null
          num_dics?: number | null
          num_tracks?: number | null
          release_day?: number | null
          release_month?: number | null
          release_year?: number | null
          spotify_id?: string | null
          upc?: string | null
        }
        Relationships: []
      }
      played_tracks: {
        Row: {
          album_popularity: number | null
          album_popularity_updated_at: number | null
          isrc: string
          listened_at: number
          play_id: number
          selected_mbid: string | null
          track_id: number
          track_popularity: number | null
          user_id: string
        }
        Insert: {
          album_popularity?: number | null
          album_popularity_updated_at?: number | null
          isrc: string
          listened_at: number
          play_id?: number
          selected_mbid?: string | null
          track_id: number
          track_popularity?: number | null
          user_id: string
        }
        Update: {
          album_popularity?: number | null
          album_popularity_updated_at?: number | null
          isrc?: string
          listened_at?: number
          play_id?: number
          selected_mbid?: string | null
          track_id?: number
          track_popularity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mbid_ref"
            columns: ["selected_mbid"]
            isOneToOne: false
            referencedRelation: "album_mbids"
            referencedColumns: ["mbid"]
          },
          {
            foreignKeyName: "track_id_ref"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["track_id"]
          },
        ]
      }
      track_mbids: {
        Row: {
          album_mbid: string
          mbid: string
          score: number | null
          track_id: number
          type: string
          updated_at: number
        }
        Insert: {
          album_mbid: string
          mbid: string
          score?: number | null
          track_id: number
          type: string
          updated_at: number
        }
        Update: {
          album_mbid?: string
          mbid?: string
          score?: number | null
          track_id?: number
          type?: string
          updated_at?: number
        }
        Relationships: [
          {
            foreignKeyName: "track_album_mbid_key"
            columns: ["album_mbid"]
            isOneToOne: false
            referencedRelation: "album_mbids"
            referencedColumns: ["mbid"]
          },
          {
            foreignKeyName: "track_mbid_key"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["track_id"]
          },
        ]
      }
      tracks: {
        Row: {
          album_id: number | null
          disk_num: number | null
          isrc: string
          spotify_id: string | null
          track_artists: string[] | null
          track_duration_ms: number | null
          track_id: number
          track_name: string | null
          track_num: number | null
        }
        Insert: {
          album_id?: number | null
          disk_num?: number | null
          isrc: string
          spotify_id?: string | null
          track_artists?: string[] | null
          track_duration_ms?: number | null
          track_id?: number
          track_name?: string | null
          track_num?: number | null
        }
        Update: {
          album_id?: number | null
          disk_num?: number | null
          isrc?: string
          spotify_id?: string | null
          track_artists?: string[] | null
          track_duration_ms?: number | null
          track_id?: number
          track_name?: string | null
          track_num?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "album_id_ref"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["album_id"]
          },
        ]
      }
      unmatched_played_tracks: {
        Row: {
          album_popularity: number | null
          album_popularity_updated_at: number | null
          isrc: string
          listened_at: number
          play_id: number
          selected_mbid: string | null
          track_id: number
          track_popularity: number | null
          user_id: string
        }
        Insert: {
          album_popularity?: number | null
          album_popularity_updated_at?: number | null
          isrc: string
          listened_at: number
          play_id?: number
          selected_mbid?: string | null
          track_id: number
          track_popularity?: number | null
          user_id: string
        }
        Update: {
          album_popularity?: number | null
          album_popularity_updated_at?: number | null
          isrc?: string
          listened_at?: number
          play_id?: number
          selected_mbid?: string | null
          track_id?: number
          track_popularity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_id_ref"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["track_id"]
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  test: {
    Tables: {
      album_art: {
        Row: {
          "1200": string | null
          "250": string | null
          "500": string | null
          large: string | null
          mbid: string
          small: string | null
          source: string
          type: string
        }
        Insert: {
          "1200"?: string | null
          "250"?: string | null
          "500"?: string | null
          large?: string | null
          mbid: string
          small?: string | null
          source: string
          type: string
        }
        Update: {
          "1200"?: string | null
          "250"?: string | null
          "500"?: string | null
          large?: string | null
          mbid?: string
          small?: string | null
          source?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "mbid_ref"
            columns: ["mbid"]
            isOneToOne: false
            referencedRelation: "album_mbids"
            referencedColumns: ["mbid"]
          },
        ]
      }
      album_mbids: {
        Row: {
          album_id: number
          mbid: string
          score: number | null
          type: string
          updated_at: number
        }
        Insert: {
          album_id: number
          mbid: string
          score?: number | null
          type: string
          updated_at: number
        }
        Update: {
          album_id?: number
          mbid?: string
          score?: number | null
          type?: string
          updated_at?: number
        }
        Relationships: [
          {
            foreignKeyName: "album_mbid"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["album_id"]
          },
        ]
      }
      albums: {
        Row: {
          album_id: number
          album_name: string | null
          album_type: string | null
          artists: string[] | null
          ean: string | null
          genre: string[] | null
          image: string | null
          num_dics: number | null
          num_tracks: number | null
          release_day: number | null
          release_month: number | null
          release_year: number | null
          spotify_id: string | null
          upc: string | null
        }
        Insert: {
          album_id?: number
          album_name?: string | null
          album_type?: string | null
          artists?: string[] | null
          ean?: string | null
          genre?: string[] | null
          image?: string | null
          num_dics?: number | null
          num_tracks?: number | null
          release_day?: number | null
          release_month?: number | null
          release_year?: number | null
          spotify_id?: string | null
          upc?: string | null
        }
        Update: {
          album_id?: number
          album_name?: string | null
          album_type?: string | null
          artists?: string[] | null
          ean?: string | null
          genre?: string[] | null
          image?: string | null
          num_dics?: number | null
          num_tracks?: number | null
          release_day?: number | null
          release_month?: number | null
          release_year?: number | null
          spotify_id?: string | null
          upc?: string | null
        }
        Relationships: []
      }
      played_tracks: {
        Row: {
          album_popularity: number | null
          album_popularity_updated_at: number | null
          isrc: string
          listened_at: number
          play_id: number
          selected_mbid: string | null
          track_id: number
          track_popularity: number | null
          user_id: string
        }
        Insert: {
          album_popularity?: number | null
          album_popularity_updated_at?: number | null
          isrc: string
          listened_at: number
          play_id?: number
          selected_mbid?: string | null
          track_id: number
          track_popularity?: number | null
          user_id: string
        }
        Update: {
          album_popularity?: number | null
          album_popularity_updated_at?: number | null
          isrc?: string
          listened_at?: number
          play_id?: number
          selected_mbid?: string | null
          track_id?: number
          track_popularity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_id_ref"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["track_id"]
          },
        ]
      }
      track_mbids: {
        Row: {
          album_mbid: string
          mbid: string
          score: number | null
          track_id: number
          type: string
          updated_at: number
        }
        Insert: {
          album_mbid: string
          mbid: string
          score?: number | null
          track_id: number
          type: string
          updated_at: number
        }
        Update: {
          album_mbid?: string
          mbid?: string
          score?: number | null
          track_id?: number
          type?: string
          updated_at?: number
        }
        Relationships: [
          {
            foreignKeyName: "track_album_mbid_key"
            columns: ["album_mbid"]
            isOneToOne: false
            referencedRelation: "album_mbids"
            referencedColumns: ["mbid"]
          },
          {
            foreignKeyName: "track_mbid_key"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["track_id"]
          },
        ]
      }
      tracks: {
        Row: {
          album_id: number | null
          disk_num: number | null
          isrc: string
          spotify_id: string | null
          track_artists: string[] | null
          track_duration_ms: number | null
          track_id: number
          track_name: string | null
          track_num: number | null
        }
        Insert: {
          album_id?: number | null
          disk_num?: number | null
          isrc: string
          spotify_id?: string | null
          track_artists?: string[] | null
          track_duration_ms?: number | null
          track_id?: number
          track_name?: string | null
          track_num?: number | null
        }
        Update: {
          album_id?: number | null
          disk_num?: number | null
          isrc?: string
          spotify_id?: string | null
          track_artists?: string[] | null
          track_duration_ms?: number | null
          track_id?: number
          track_name?: string | null
          track_num?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "album_id_ref"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["album_id"]
          },
        ]
      }
      unmatched_played_tracks: {
        Row: {
          album_popularity: number | null
          album_popularity_updated_at: number | null
          isrc: string
          listened_at: number
          play_id: number
          selected_mbid: string | null
          track_id: number
          track_popularity: number | null
          user_id: string
        }
        Insert: {
          album_popularity?: number | null
          album_popularity_updated_at?: number | null
          isrc: string
          listened_at: number
          play_id?: number
          selected_mbid?: string | null
          track_id: number
          track_popularity?: number | null
          user_id: string
        }
        Update: {
          album_popularity?: number | null
          album_popularity_updated_at?: number | null
          isrc?: string
          listened_at?: number
          play_id?: number
          selected_mbid?: string | null
          track_id?: number
          track_popularity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_id_ref"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["track_id"]
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
  prod: {
    Enums: {},
  },
  test: {
    Enums: {},
  },
} as const

