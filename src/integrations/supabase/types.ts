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
      agreements: {
        Row: {
          agrees_to_all_docs: boolean
          application_id: string
          created_at: string
          id: string
          signature: string
          signature_date: string
          updated_at: string
        }
        Insert: {
          agrees_to_all_docs: boolean
          application_id: string
          created_at?: string
          id?: string
          signature: string
          signature_date: string
          updated_at?: string
        }
        Update: {
          agrees_to_all_docs?: boolean
          application_id?: string
          created_at?: string
          id?: string
          signature?: string
          signature_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      album_likes: {
        Row: {
          album_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          album_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_likes_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      album_tags: {
        Row: {
          album_id: string
          created_at: string
          id: string
          tag: string
        }
        Insert: {
          album_id: string
          created_at?: string
          id?: string
          tag: string
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_tags_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          likes: number
          privacy: string
          title: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          likes?: number
          privacy?: string
          title: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          likes?: number
          privacy?: string
          title?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_comments_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_chats: {
        Row: {
          content: string
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          room_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          room_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          room_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      creator_applications: {
        Row: {
          agrees_to_terms: boolean
          created_at: string
          date_submitted: string
          id: string
          is_over_18: boolean
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agrees_to_terms: boolean
          created_at?: string
          date_submitted: string
          id?: string
          is_over_18: boolean
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agrees_to_terms?: boolean
          created_at?: string
          date_submitted?: string
          id?: string
          is_over_18?: boolean
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          application_id: string
          bio: string
          content_categories: string[]
          created_at: string
          display_name: string
          id: string
          profile_photo_url: string
          updated_at: string
        }
        Insert: {
          application_id: string
          bio: string
          content_categories: string[]
          created_at?: string
          display_name: string
          id?: string
          profile_photo_url: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          bio?: string
          content_categories?: string[]
          created_at?: string
          display_name?: string
          id?: string
          profile_photo_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      followings: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followings_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followings_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hashtag_notification_preferences: {
        Row: {
          created_at: string | null
          hashtag: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hashtag: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          hashtag?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      identities: {
        Row: {
          application_id: string
          country_of_residence: string
          created_at: string
          date_of_birth: string
          full_name: string
          government_id_back_url: string
          government_id_front_url: string
          id: string
          selfie_url: string
          updated_at: string
        }
        Insert: {
          application_id: string
          country_of_residence: string
          created_at?: string
          date_of_birth: string
          full_name: string
          government_id_back_url: string
          government_id_front_url: string
          id?: string
          selfie_url: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          country_of_residence?: string
          created_at?: string
          date_of_birth?: string
          full_name?: string
          government_id_back_url?: string
          government_id_front_url?: string
          id?: string
          selfie_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          album_id: string
          created_at: string
          description: string | null
          duration: number | null
          file_name: string
          file_size: number
          file_type: string
          height: number | null
          id: string
          likes: number
          thumbnail_url: string | null
          updated_at: string
          url: string
          user_id: string
          views: number
          width: number | null
        }
        Insert: {
          album_id: string
          created_at?: string
          description?: string | null
          duration?: number | null
          file_name: string
          file_size: number
          file_type: string
          height?: number | null
          id?: string
          likes?: number
          thumbnail_url?: string | null
          updated_at?: string
          url: string
          user_id: string
          views?: number
          width?: number | null
        }
        Update: {
          album_id?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          file_name?: string
          file_size?: number
          file_type?: string
          height?: number | null
          id?: string
          likes?: number
          thumbnail_url?: string | null
          updated_at?: string
          url?: string
          user_id?: string
          views?: number
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      media_bookmarks: {
        Row: {
          created_at: string
          id: string
          media_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_bookmarks_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      media_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          media_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_comments_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      media_likes: {
        Row: {
          created_at: string
          id: string
          media_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_likes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          all_posts: boolean
          created_at: string | null
          followed_users: boolean
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_posts?: boolean
          created_at?: string | null
          followed_users?: boolean
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_posts?: boolean
          created_at?: string | null
          followed_users?: boolean
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_infos: {
        Row: {
          application_id: string
          created_at: string
          id: string
          payout_currency: string
          payout_schedule: string
          stripe_connect_id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          payout_currency: string
          payout_schedule: string
          stripe_connect_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          payout_currency?: string
          payout_schedule?: string
          stripe_connect_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_infos_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          created_at: string | null
          hashtag: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          hashtag: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          hashtag?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_likes_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          aspect_ratio: number | null
          created_at: string | null
          duration: number | null
          id: string
          position: number
          post_id: string
          type: string
          url: string
        }
        Insert: {
          aspect_ratio?: number | null
          created_at?: string | null
          duration?: number | null
          id?: string
          position?: number
          post_id: string
          type: string
          url: string
        }
        Update: {
          aspect_ratio?: number | null
          created_at?: string | null
          duration?: number | null
          id?: string
          position?: number
          post_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allow_messages: boolean | null
          avatar_url: string | null
          banner_url: string | null
          bdsm_role: string
          bio: string | null
          birthday: string | null
          created_at: string | null
          hard_limits: string | null
          id: string
          is_admin: boolean
          kinks: string | null
          last_active: string | null
          location: string | null
          looking_for: string | null
          media_visibility: string | null
          orientation: string | null
          show_online_status: boolean | null
          soft_limits: string | null
          user_role: string | null
          username: string | null
          visibility: string | null
        }
        Insert: {
          allow_messages?: boolean | null
          avatar_url?: string | null
          banner_url?: string | null
          bdsm_role?: string
          bio?: string | null
          birthday?: string | null
          created_at?: string | null
          hard_limits?: string | null
          id: string
          is_admin?: boolean
          kinks?: string | null
          last_active?: string | null
          location?: string | null
          looking_for?: string | null
          media_visibility?: string | null
          orientation?: string | null
          show_online_status?: boolean | null
          soft_limits?: string | null
          user_role?: string | null
          username?: string | null
          visibility?: string | null
        }
        Update: {
          allow_messages?: boolean | null
          avatar_url?: string | null
          banner_url?: string | null
          bdsm_role?: string
          bio?: string | null
          birthday?: string | null
          created_at?: string | null
          hard_limits?: string | null
          id?: string
          is_admin?: boolean
          kinks?: string | null
          last_active?: string | null
          location?: string | null
          looking_for?: string | null
          media_visibility?: string | null
          orientation?: string | null
          show_online_status?: boolean | null
          soft_limits?: string | null
          user_role?: string | null
          username?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      tax_infos: {
        Row: {
          application_id: string
          business_name: string | null
          created_at: string
          id: string
          is_us_citizen: boolean
          tax_address: string
          tax_classification: string
          tax_country: string
          tax_id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          business_name?: string | null
          created_at?: string
          id?: string
          is_us_citizen: boolean
          tax_address: string
          tax_classification: string
          tax_country: string
          tax_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          business_name?: string | null
          created_at?: string
          id?: string
          is_us_citizen?: boolean
          tax_address?: string
          tax_classification?: string
          tax_country?: string
          tax_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_infos_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          bitrate: number | null
          category: string
          created_at: string
          description: string | null
          duration: number | null
          format: string | null
          height: number | null
          id: string
          likes: number
          status: string
          tags: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
          views: number
          visibility: string
          width: number | null
        }
        Insert: {
          bitrate?: number | null
          category?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          format?: string | null
          height?: number | null
          id?: string
          likes?: number
          status?: string
          tags?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
          views?: number
          visibility?: string
          width?: number | null
        }
        Update: {
          bitrate?: number | null
          category?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          format?: string | null
          height?: number | null
          id?: string
          likes?: number
          status?: string
          tags?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
          views?: number
          visibility?: string
          width?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      trending_hashtags: {
        Row: {
          hashtag: string | null
          latest_usage: string | null
          post_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrement_album_likes: {
        Args: {
          album_id: string
        }
        Returns: number
      }
      decrement_media_likes: {
        Args: {
          media_id: string
        }
        Returns: number
      }
      get_user_conversations: {
        Args: {
          user_id: string
        }
        Returns: string[]
      }
      increment_album_likes: {
        Args: {
          album_id: string
        }
        Returns: number
      }
      increment_album_views: {
        Args: {
          album_id: string
        }
        Returns: undefined
      }
      increment_media_likes: {
        Args: {
          media_id: string
        }
        Returns: number
      }
      increment_media_views: {
        Args: {
          media_id: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: {
          user_id: string
          conversation_id: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
