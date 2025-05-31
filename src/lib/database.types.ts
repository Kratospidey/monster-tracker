export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      drinks: {
        Row: {
          id: string
          created_at: string
          name: string
          series: string
          volume_ml: number
          cost: number
          rating: number
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          series: string
          volume_ml: number
          cost: number
          rating: number
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          series?: string
          volume_ml?: number
          cost?: number
          rating?: number
          notes?: string | null
          user_id?: string
        }
      }
      can_images: {
        Row: {
          id: string
          created_at: string
          can_name: string
          series: string
          image_url: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          can_name: string
          series: string
          image_url: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          can_name?: string
          series?: string
          image_url?: string
          user_id?: string
        }
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
  }
} 