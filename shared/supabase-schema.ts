/**
 * Supabase Database Types
 * Generated from Supabase schema
 * Run: npx supabase gen types typescript --project-id <project-id> > shared/supabase-schema.ts
 * 
 * For now, manually defined types matching our schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VerificationTier = 'gold' | 'silver' | 'bronze';
export type ProductType = 'raw' | 'compound' | 'processed';
export type PurityLevel = '99' | '99.5' | '99.9';
export type Availability = 'in-stock' | 'limited' | 'contact';
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type TelebuyStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type DocumentType = 'contract' | 'quote' | 'notes' | 'other';
export type UserRole = 'buyer' | 'supplier' | 'admin';

export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          verification_tier: VerificationTier;
          rating: number;
          review_count: number;
          transaction_count: number;
          response_time: string | null;
          years_in_business: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          verification_tier: VerificationTier;
          rating?: number;
          review_count?: number;
          transaction_count?: number;
          response_time?: string | null;
          years_in_business?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          verification_tier?: VerificationTier;
          rating?: number;
          review_count?: number;
          transaction_count?: number;
          response_time?: string | null;
          years_in_business?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      supplier_profiles: {
        Row: {
          id: string;
          supplier_id: string;
          description: string | null;
          website: string | null;
          contact_email: string | null;
          phone: string | null;
          specialties: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          description?: string | null;
          website?: string | null;
          contact_email?: string | null;
          phone?: string | null;
          specialties?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          description?: string | null;
          website?: string | null;
          contact_email?: string | null;
          phone?: string | null;
          specialties?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          supplier_id: string;
          country: string;
          city: string | null;
          address: string | null;
          coordinates: unknown | null; // PostGIS POINT type
          is_primary: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          country: string;
          city?: string | null;
          address?: string | null;
          coordinates?: unknown | null;
          is_primary?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          country?: string;
          city?: string | null;
          address?: string | null;
          coordinates?: unknown | null;
          is_primary?: boolean | null;
          created_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          supplier_id: string;
          name: string;
          product_type: ProductType;
          purity_level: PurityLevel;
          price_per_unit: number;
          currency: string;
          unit: string;
          min_order_quantity: number | null;
          availability: Availability;
          has_bulk_discount: boolean;
          bulk_discount_threshold: number | null;
          bulk_discount_percentage: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          name: string;
          product_type: ProductType;
          purity_level: PurityLevel;
          price_per_unit: number;
          currency?: string;
          unit?: string;
          min_order_quantity?: number | null;
          availability: Availability;
          has_bulk_discount?: boolean;
          bulk_discount_threshold?: number | null;
          bulk_discount_percentage?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          name?: string;
          product_type?: ProductType;
          purity_level?: PurityLevel;
          price_per_unit?: number;
          currency?: string;
          unit?: string;
          min_order_quantity?: number | null;
          availability?: Availability;
          has_bulk_discount?: boolean;
          bulk_discount_threshold?: number | null;
          bulk_discount_percentage?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      certifications: {
        Row: {
          id: string;
          supplier_id: string;
          certification_type: string;
          certification_number: string | null;
          issued_by: string | null;
          issued_date: string | null;
          expiry_date: string | null;
          certificate_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          certification_type: string;
          certification_number?: string | null;
          issued_by?: string | null;
          issued_date?: string | null;
          expiry_date?: string | null;
          certificate_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          certification_type?: string;
          certification_number?: string | null;
          issued_by?: string | null;
          issued_date?: string | null;
          expiry_date?: string | null;
          certificate_url?: string | null;
          created_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          supplier_id: string;
          user_id: string | null;
          author: string;
          company: string | null;
          rating: number;
          content: string;
          verified_purchase: boolean;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          user_id?: string | null;
          author: string;
          company?: string | null;
          rating: number;
          content: string;
          verified_purchase?: boolean;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          user_id?: string | null;
          author?: string;
          company?: string | null;
          rating?: number;
          content?: string;
          verified_purchase?: boolean;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          supplier_id: string;
          user_id: string | null;
          product_id: string | null;
          quantity: number;
          requested_price: number | null;
          status: QuoteStatus;
          expires_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          user_id?: string | null;
          product_id?: string | null;
          quantity: number;
          requested_price?: number | null;
          status?: QuoteStatus;
          expires_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          user_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          requested_price?: number | null;
          status?: QuoteStatus;
          expires_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          supplier_id: string;
          user_id: string | null;
          quote_id: string | null;
          status: OrderStatus;
          total_amount: number;
          currency: string;
          payment_status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          user_id?: string | null;
          quote_id?: string | null;
          status?: OrderStatus;
          total_amount: number;
          currency?: string;
          payment_status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          user_id?: string | null;
          quote_id?: string | null;
          status?: OrderStatus;
          total_amount?: number;
          currency?: string;
          payment_status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      telebuy_sessions: {
        Row: {
          id: string;
          supplier_id: string;
          user_id: string | null;
          meeting_url: string;
          meeting_id: string | null;
          status: TelebuyStatus;
          scheduled_at: string;
          started_at: string | null;
          ended_at: string | null;
          recording_url: string | null;
          transcript: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          user_id?: string | null;
          meeting_url: string;
          meeting_id?: string | null;
          status?: TelebuyStatus;
          scheduled_at: string;
          started_at?: string | null;
          ended_at?: string | null;
          recording_url?: string | null;
          transcript?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          user_id?: string | null;
          meeting_url?: string;
          meeting_id?: string | null;
          status?: TelebuyStatus;
          scheduled_at?: string;
          started_at?: string | null;
          ended_at?: string | null;
          recording_url?: string | null;
          transcript?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      telebuy_documents: {
        Row: {
          id: string;
          session_id: string;
          document_type: DocumentType;
          content: Json;
          version: number;
          signed_at: string | null;
          signed_by: string | null;
          docusign_envelope_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          document_type: DocumentType;
          content: Json;
          version?: number;
          signed_at?: string | null;
          signed_by?: string | null;
          docusign_envelope_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          document_type?: DocumentType;
          content?: Json;
          version?: number;
          signed_at?: string | null;
          signed_by?: string | null;
          docusign_envelope_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          company_name: string | null;
          phone: string | null;
          role: UserRole;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

