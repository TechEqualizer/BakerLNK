// TypeScript types for BakerLNK Supabase integration
// This file contains all the types that match our database schema

export interface Database {
  public: {
    Tables: {
      bakers: {
        Row: {
          id: string
          user_id: string
          business_name: string
          tagline: string | null
          description: string | null
          email: string | null
          phone_number: string | null
          location: string | null
          logo_url: string | null
          hero_image_url: string | null
          selected_theme_id: string | null
          lead_time_days: number
          max_orders_per_day: number | null
          deposit_percentage: number | null
          instagram_url: string | null
          facebook_url: string | null
          tiktok_url: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          tagline?: string | null
          description?: string | null
          email?: string | null
          phone_number?: string | null
          location?: string | null
          logo_url?: string | null
          hero_image_url?: string | null
          selected_theme_id?: string | null
          lead_time_days?: number
          max_orders_per_day?: number | null
          deposit_percentage?: number | null
          instagram_url?: string | null
          facebook_url?: string | null
          tiktok_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          tagline?: string | null
          description?: string | null
          email?: string | null
          phone_number?: string | null
          location?: string | null
          logo_url?: string | null
          hero_image_url?: string | null
          selected_theme_id?: string | null
          lead_time_days?: number
          max_orders_per_day?: number | null
          deposit_percentage?: number | null
          instagram_url?: string | null
          facebook_url?: string | null
          tiktok_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      themes: {
        Row: {
          id: string
          theme_name: string
          description: string | null
          category: string
          css_variables: string | null
          light_mode_variables: string | null
          dark_mode_variables: string | null
          background_texture_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          theme_name: string
          description?: string | null
          category?: string
          css_variables?: string | null
          light_mode_variables?: string | null
          dark_mode_variables?: string | null
          background_texture_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme_name?: string
          description?: string | null
          category?: string
          css_variables?: string | null
          light_mode_variables?: string | null
          dark_mode_variables?: string | null
          background_texture_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          baker_id: string
          name: string
          email: string | null
          phone: string | null
          notes: string | null
          tags: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          baker_id: string
          name: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          baker_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          baker_id: string
          customer_id: string
          status: string
          event_date: string | null
          event_type: string | null
          serves_count: number | null
          budget_min: number | null
          budget_max: number | null
          cake_description: string | null
          special_requests: string | null
          quoted_price: number | null
          deposit_amount: number | null
          deposit_paid: boolean
          baker_notes: string | null
          priority: string
          pickup_delivery: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          baker_id: string
          customer_id: string
          status?: string
          event_date?: string | null
          event_type?: string | null
          serves_count?: number | null
          budget_min?: number | null
          budget_max?: number | null
          cake_description?: string | null
          special_requests?: string | null
          quoted_price?: number | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          baker_notes?: string | null
          priority?: string
          pickup_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          baker_id?: string
          customer_id?: string
          status?: string
          event_date?: string | null
          event_type?: string | null
          serves_count?: number | null
          budget_min?: number | null
          budget_max?: number | null
          cake_description?: string | null
          special_requests?: string | null
          quoted_price?: number | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          baker_notes?: string | null
          priority?: string
          pickup_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          baker_id: string
          title: string
          description: string | null
          image_url: string
          category: string | null
          tags: string | null
          featured: boolean
          price_range: string | null
          serves_count: number | null
          hearts_count: number
          inquiries_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          baker_id: string
          title: string
          description?: string | null
          image_url: string
          category?: string | null
          tags?: string | null
          featured?: boolean
          price_range?: string | null
          serves_count?: number | null
          hearts_count?: number
          inquiries_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          baker_id?: string
          title?: string
          description?: string | null
          image_url?: string
          category?: string | null
          tags?: string | null
          featured?: boolean
          price_range?: string | null
          serves_count?: number | null
          hearts_count?: number
          inquiries_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          baker_id: string
          customer_id: string
          content: string
          sender_type: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          baker_id: string
          customer_id: string
          content: string
          sender_type: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          baker_id?: string
          customer_id?: string
          content?: string
          sender_type?: string
          read_at?: string | null
          created_at?: string
        }
      }
      gallery_inquiries: {
        Row: {
          id: string
          user_id: string
          gallery_item_id: string
          created_date: string
        }
        Insert: {
          id?: string
          user_id: string
          gallery_item_id: string
          created_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          gallery_item_id?: string
          created_date?: string
        }
      }
      files: {
        Row: {
          id: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          file_path: string
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          file_path: string
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          file_path?: string
          uploaded_by?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Convenience types for easier use in components
export type Baker = Database['public']['Tables']['bakers']['Row']
export type Theme = Database['public']['Tables']['themes']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Gallery = Database['public']['Tables']['gallery']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type GalleryInquiry = Database['public']['Tables']['gallery_inquiries']['Row']
export type File = Database['public']['Tables']['files']['Row']

export type BakerInsert = Database['public']['Tables']['bakers']['Insert']
export type ThemeInsert = Database['public']['Tables']['themes']['Insert']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type GalleryInsert = Database['public']['Tables']['gallery']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type GalleryInquiryInsert = Database['public']['Tables']['gallery_inquiries']['Insert']
export type FileInsert = Database['public']['Tables']['files']['Insert']