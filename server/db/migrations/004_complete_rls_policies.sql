-- Complete RLS Policies Migration
-- Migration 004: Additional RLS refinements and service role bypass
-- This migration fills the numbering gap and adds refinements to existing policies

-- ============================================
-- SERVICE ROLE BYPASS POLICIES
-- ============================================
-- These policies allow the service role (used by the backend) to bypass RLS
-- This is important for admin operations and backend services

-- Suppliers: Service role full access
CREATE POLICY "Service role can manage all suppliers"
  ON suppliers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Supplier profiles: Service role full access
CREATE POLICY "Service role can manage all supplier profiles"
  ON supplier_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Products: Service role full access
CREATE POLICY "Service role can manage all products"
  ON products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Quotes: Service role full access
CREATE POLICY "Service role can manage all quotes"
  ON quotes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Orders: Service role full access
CREATE POLICY "Service role can manage all orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User profiles: Service role full access
CREATE POLICY "Service role can manage all user profiles"
  ON user_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Telebuy sessions: Service role full access
CREATE POLICY "Service role can manage all telebuy sessions"
  ON telebuy_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Telebuy documents: Service role full access
CREATE POLICY "Service role can manage all telebuy documents"
  ON telebuy_documents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Reviews: Service role full access
CREATE POLICY "Service role can manage all reviews"
  ON reviews FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Locations: Service role full access
CREATE POLICY "Service role can manage all locations"
  ON locations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Certifications: Service role full access
CREATE POLICY "Service role can manage all certifications"
  ON certifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ADDITIONAL POLICY REFINEMENTS
-- ============================================

-- Allow suppliers to update their own orders (status changes)
CREATE POLICY "Suppliers can update orders for their supplies"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN user_profiles up ON up.user_id = auth.uid()
      WHERE s.id = orders.supplier_id
      AND up.role = 'supplier'
    )
  );

-- Allow authenticated users to delete their own quotes (before acceptance)
CREATE POLICY "Users can delete their own pending quotes"
  ON quotes FOR DELETE
  USING (
    auth.uid() = user_id
    AND status = 'pending'
  );

-- ============================================
-- TELEBUY SESSION REFINEMENTS
-- ============================================
-- Note: Current schema uses user_id for the buyer.
-- Future enhancement: Add supplier_contact_id column for direct supplier access

-- Allow updating session status by participants
CREATE POLICY "Participants can update telebuy session status"
  ON telebuy_sessions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM suppliers s
      JOIN user_profiles up ON up.user_id = auth.uid()
      WHERE s.id = telebuy_sessions.supplier_id
      AND up.role IN ('supplier', 'admin')
    )
  );

-- ============================================
-- ANONYMOUS READ POLICIES FOR PUBLIC DATA
-- ============================================
-- Allow unauthenticated users to read public supplier data

CREATE POLICY "Anonymous users can view suppliers"
  ON suppliers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can view supplier profiles"
  ON supplier_profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can view products"
  ON products FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can view locations"
  ON locations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can view certifications"
  ON certifications FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can view reviews"
  ON reviews FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- VALIDATION COMMENT
-- ============================================
-- Run this query after applying migrations to verify RLS is enabled:
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND rowsecurity = true;
--
-- Expected: All tables should have rowsecurity = true
