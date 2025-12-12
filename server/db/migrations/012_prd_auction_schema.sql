-- PRD Auction Schema Migration
-- Migration 012: PRD v2.0 Auction Schema with Verification-First Design
-- This migration enhances the auction system to align with PRD requirements
-- Includes blockchain verification support, multi-winner fulfillment, and comprehensive audit trails

-- ============================================
-- ENUMS for Type Safety
-- ============================================

-- Material types for lithium auctions
DO $$ BEGIN
  CREATE TYPE material_type_enum AS ENUM ('Carbonate', 'Hydroxide', 'Spodumene');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Grade levels for lithium purity
DO $$ BEGIN
  CREATE TYPE grade_enum AS ENUM ('99', '99.5', '99.9');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Delivery incoterms
DO $$ BEGIN
  CREATE TYPE delivery_incoterms_enum AS ENUM ('CIF', 'FOB', 'DDP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enhanced auction status
DO $$ BEGIN
  CREATE TYPE auction_status_enum AS ENUM ('draft', 'active', 'closed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Verification status
DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected', 'flagged');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Verification result
DO $$ BEGIN
  CREATE TYPE verification_result_enum AS ENUM ('approved', 'rejected', 'flagged');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Verification type
DO $$ BEGIN
  CREATE TYPE verification_type_enum AS ENUM ('material_type', 'grade', 'quantity', 'delivery_terms', 'documents');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document type
DO $$ BEGIN
  CREATE TYPE document_type_enum AS ENUM ('COA', 'certification', 'test_report', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Blockchain network (V2 - deferred to future migration)
-- DO $$ BEGIN
--   CREATE TYPE blockchain_network_enum AS ENUM ('mainnet', 'sepolia', 'goerli');
-- EXCEPTION
--   WHEN duplicate_object THEN null;
-- END $$;

-- Blockchain record status (V2 - deferred to future migration)
-- DO $$ BEGIN
--   CREATE TYPE blockchain_record_status_enum AS ENUM ('pending', 'confirmed', 'failed');
-- EXCEPTION
--   WHEN duplicate_object THEN null;
-- END $$;

-- ============================================
-- ALTER EXISTING AUCTIONS TABLE
-- ============================================

-- Add PRD-specific fields to auctions table
ALTER TABLE auctions
  -- Unique auction identifier (format: AU-YYYYMMDD-XXX)
  ADD COLUMN IF NOT EXISTS auction_number TEXT UNIQUE,
  
  -- Material and grade (VERIFIED FIELDS)
  ADD COLUMN IF NOT EXISTS material_type material_type_enum,
  ADD COLUMN IF NOT EXISTS grade grade_enum,
  
  -- Quantity tracking (supports multi-winner partial fulfillment)
  ADD COLUMN IF NOT EXISTS quantity_total DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS quantity_remaining DECIMAL(12, 2),
  
  -- Delivery information
  ADD COLUMN IF NOT EXISTS delivery_incoterms delivery_incoterms_enum,
  ADD COLUMN IF NOT EXISTS delivery_port TEXT,
  ADD COLUMN IF NOT EXISTS delivery_date DATE,
  
  -- Enhanced scheduling
  ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ,
  
  -- Winner tracking (nullable for multi-winner support)
  ADD COLUMN IF NOT EXISTS winning_bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS winning_buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS final_price DECIMAL(12, 2),
  
  -- Verification fields (CRITICAL for data integrity)
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verification_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Update status column to use new enum (if not already using it)
-- Note: This assumes status column exists. We'll handle enum conversion carefully.
DO $$ 
BEGIN
  -- Update status values to match new enum if needed
  UPDATE auctions 
  SET status = CASE 
    WHEN status = 'scheduled' THEN 'draft'
    WHEN status = 'live' THEN 'active'
    WHEN status = 'ended' THEN 'closed'
    ELSE status::text
  END::text
  WHERE status NOT IN ('draft', 'active', 'closed', 'completed', 'cancelled');
END $$;

-- Create function to generate unique auction numbers
CREATE OR REPLACE FUNCTION generate_auction_number()
RETURNS TEXT AS $$
DECLARE
  date_prefix TEXT;
  sequence_num INTEGER;
  auction_num TEXT;
BEGIN
  date_prefix := 'AU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(auction_number FROM LENGTH(date_prefix) + 1) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM auctions
  WHERE auction_number LIKE date_prefix || '%';
  
  auction_num := date_prefix || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN auction_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUCTION DOCUMENTS TABLE
-- ============================================
-- Stores COA, certifications, test reports, and other verification documents

CREATE TABLE IF NOT EXISTS auction_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  document_type document_type_enum NOT NULL,
  document_url TEXT NOT NULL, -- S3/storage URL
  document_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  -- ipfs_hash TEXT, -- V2: IPFS hash for blockchain storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_document_url CHECK (document_url ~ '^https?://'),
  CONSTRAINT verified_requires_verifier CHECK (
    (verified = false) OR (verified_by IS NOT NULL)
  )
);

-- ============================================
-- AUCTION VERIFICATIONS TABLE
-- ============================================
-- Detailed verification audit trail with blockchain support

CREATE TABLE IF NOT EXISTS auction_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  verification_type verification_type_enum NOT NULL,
  field_name TEXT NOT NULL, -- Which field was verified (e.g., 'material_type', 'grade')
  field_value TEXT NOT NULL, -- Verified value
  verified_by_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_timestamp TIMESTAMPTZ DEFAULT NOW(),
  verification_result verification_result_enum NOT NULL,
  admin_notes TEXT,
  evidence_urls JSONB, -- Array of URLs to supporting documents
  
  -- V2: Blockchain fields (deferred to future migration)
  -- blockchain_recorded BOOLEAN DEFAULT false,
  -- blockchain_tx_hash TEXT, -- Ethereum transaction hash
  -- blockchain_block_number BIGINT,
  -- blockchain_timestamp TIMESTAMPTZ,
  -- ipfs_hash TEXT, -- IPFS hash for document storage
  -- blockchain_requested_at TIMESTAMPTZ, -- When user requested on-chain proof
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_verification_per_field UNIQUE (auction_id, verification_type, field_name)
  -- V2: Blockchain constraints (deferred)
  -- CONSTRAINT blockchain_hash_format CHECK (
  --   (blockchain_tx_hash IS NULL) OR (blockchain_tx_hash ~ '^0x[0-9a-fA-F]{64}$')
  -- ),
  -- CONSTRAINT blockchain_recorded_requires_hash CHECK (
  --   (blockchain_recorded = false) OR (blockchain_tx_hash IS NOT NULL)
  -- )
);

-- ============================================
-- V2: BLOCKCHAIN VERIFICATION RECORDS TABLE
-- ============================================
-- Deferred to future migration

-- CREATE TABLE IF NOT EXISTS blockchain_verification_records (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   verification_id UUID NOT NULL REFERENCES auction_verifications(id) ON DELETE CASCADE,
--   auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
--   smart_contract_address TEXT NOT NULL,
--   tx_hash TEXT UNIQUE NOT NULL,
--   block_number BIGINT NOT NULL,
--   gas_used BIGINT,
--   gas_price BIGINT,
--   network blockchain_network_enum NOT NULL DEFAULT 'sepolia',
--   recorded_at TIMESTAMPTZ DEFAULT NOW(),
--   requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
--   verification_data_hash TEXT NOT NULL,
--   status blockchain_record_status_enum DEFAULT 'pending',
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW(),
--   CONSTRAINT valid_tx_hash CHECK (tx_hash ~ '^0x[0-9a-fA-F]{64}$'),
--   CONSTRAINT valid_contract_address CHECK (smart_contract_address ~ '^0x[0-9a-fA-F]{40}$'),
--   CONSTRAINT valid_data_hash CHECK (verification_data_hash ~ '^0x[0-9a-fA-F]{64}$')
-- );

-- ============================================
-- AUCTION WINNERS TABLE
-- ============================================
-- Supports multi-winner partial fulfillment

CREATE TABLE IF NOT EXISTS auction_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity_won DECIMAL(12, 2) NOT NULL, -- Portion of total quantity
  price_per_unit DECIMAL(12, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contract_sent', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_quantity CHECK (quantity_won > 0),
  CONSTRAINT positive_price CHECK (price_per_unit > 0),
  CONSTRAINT positive_total CHECK (total_amount > 0),
  CONSTRAINT quantity_matches_price CHECK (ABS(total_amount - (quantity_won * price_per_unit)) < 0.01)
);

-- ============================================
-- BID HISTORY TABLE
-- ============================================
-- Complete audit trail of all bid changes

CREATE TABLE IF NOT EXISTS bid_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bid_price_per_unit DECIMAL(12, 2) NOT NULL,
  bid_quantity DECIMAL(12, 2), -- If bidding on specific quantity
  total_bid_amount DECIMAL(12, 2) NOT NULL,
  status_change TEXT NOT NULL, -- 'placed', 'revised', 'outbid', 'withdrawn', 'won'
  rank_at_time INTEGER, -- Bid ranking at the time of this change
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET, -- IP address for fraud detection
  user_agent TEXT, -- User agent for audit trail
  
  CONSTRAINT positive_bid_price CHECK (bid_price_per_unit > 0),
  CONSTRAINT positive_bid_amount CHECK (total_bid_amount > 0),
  CONSTRAINT valid_status CHECK (status_change IN ('placed', 'revised', 'outbid', 'withdrawn', 'won'))
);

-- ============================================
-- WATCHLIST TABLE
-- ============================================
-- Buyers can watchlist auctions they're interested in

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_watchlist_entry UNIQUE (buyer_id, auction_id)
);

-- ============================================
-- TRANSACTION TABLE
-- ============================================
-- Links winning bids to settlement workflow

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  winning_bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contract_sent', 'completed', 'cancelled')),
  contract_url TEXT, -- URL to signed contract document
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'disputed')),
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KYC VERIFICATIONS TABLE
-- ============================================
-- User KYC verification status and documents

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID, -- Reference to company profile if exists
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  company_name TEXT,
  company_registration_number TEXT,
  company_address JSONB,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  verification_documents JSONB, -- Array of document URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_kyc UNIQUE (user_id)
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Auction indexes
CREATE INDEX IF NOT EXISTS idx_auctions_auction_number ON auctions(auction_number);
CREATE INDEX IF NOT EXISTS idx_auctions_material_type ON auctions(material_type);
CREATE INDEX IF NOT EXISTS idx_auctions_grade ON auctions(grade);
CREATE INDEX IF NOT EXISTS idx_auctions_verification_status ON auctions(verification_status);
CREATE INDEX IF NOT EXISTS idx_auctions_scheduled_times ON auctions(scheduled_start, scheduled_end);
CREATE INDEX IF NOT EXISTS idx_auctions_status_scheduled ON auctions(status, scheduled_start, scheduled_end) 
  WHERE status IN ('draft', 'active');

-- Auction documents indexes
CREATE INDEX IF NOT EXISTS idx_auction_documents_auction ON auction_documents(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_documents_type ON auction_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_auction_documents_verified ON auction_documents(verified, verified_by);
-- V2: IPFS index (deferred)
-- CREATE INDEX IF NOT EXISTS idx_auction_documents_ipfs ON auction_documents(ipfs_hash) WHERE ipfs_hash IS NOT NULL;

-- Auction verifications indexes
CREATE INDEX IF NOT EXISTS idx_auction_verifications_auction ON auction_verifications(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_verifications_type ON auction_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_auction_verifications_result ON auction_verifications(verification_result);
-- V2: Blockchain index (deferred)
-- CREATE INDEX IF NOT EXISTS idx_auction_verifications_blockchain ON auction_verifications(blockchain_recorded, blockchain_tx_hash) 
--   WHERE blockchain_recorded = true;
CREATE INDEX IF NOT EXISTS idx_auction_verifications_admin ON auction_verifications(verified_by_admin_id);

-- V2: Blockchain verification records indexes (deferred)
-- CREATE INDEX IF NOT EXISTS idx_blockchain_records_verification ON blockchain_verification_records(verification_id);
-- CREATE INDEX IF NOT EXISTS idx_blockchain_records_auction ON blockchain_verification_records(auction_id);
-- CREATE INDEX IF NOT EXISTS idx_blockchain_records_tx_hash ON blockchain_verification_records(tx_hash);
-- CREATE INDEX IF NOT EXISTS idx_blockchain_records_status ON blockchain_verification_records(status);
-- CREATE INDEX IF NOT EXISTS idx_blockchain_records_network ON blockchain_verification_records(network, block_number);

-- Auction winners indexes
CREATE INDEX IF NOT EXISTS idx_auction_winners_auction ON auction_winners(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_winners_bid ON auction_winners(bid_id);
CREATE INDEX IF NOT EXISTS idx_auction_winners_buyer ON auction_winners(buyer_id);
CREATE INDEX IF NOT EXISTS idx_auction_winners_status ON auction_winners(status);

-- Bid history indexes
CREATE INDEX IF NOT EXISTS idx_bid_history_auction ON bid_history(auction_id);
CREATE INDEX IF NOT EXISTS idx_bid_history_bid ON bid_history(bid_id);
CREATE INDEX IF NOT EXISTS idx_bid_history_buyer ON bid_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bid_history_timestamp ON bid_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bid_history_auction_timestamp ON bid_history(auction_id, timestamp DESC);

-- Watchlist indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_buyer ON watchlist(buyer_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_auction ON watchlist(auction_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_buyer_auction ON watchlist(buyer_id, auction_id);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_auction ON transactions(auction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_supplier ON transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- KYC verifications indexes
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(kyc_status);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_reviewed_by ON kyc_verifications(reviewed_by);

-- ============================================
-- TRIGGERS for Updated At
-- ============================================

CREATE TRIGGER update_auction_documents_updated_at 
  BEFORE UPDATE ON auction_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_verifications_updated_at 
  BEFORE UPDATE ON auction_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- V2: Blockchain trigger (deferred)
-- CREATE TRIGGER update_blockchain_verification_records_updated_at 
--   BEFORE UPDATE ON blockchain_verification_records
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_winners_updated_at 
  BEFORE UPDATE ON auction_winners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at 
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS for Business Logic
-- ============================================

-- Function to automatically set verification_timestamp when verification_status changes
CREATE OR REPLACE FUNCTION set_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status != OLD.verification_status AND NEW.verification_status = 'verified' THEN
    NEW.verification_timestamp := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_auction_verification_timestamp
  BEFORE UPDATE ON auctions
  FOR EACH ROW
  WHEN (NEW.verification_status IS DISTINCT FROM OLD.verification_status)
  EXECUTE FUNCTION set_verification_timestamp();

-- Function to validate quantity_remaining doesn't exceed quantity_total
CREATE OR REPLACE FUNCTION validate_auction_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_remaining > NEW.quantity_total THEN
    RAISE EXCEPTION 'quantity_remaining cannot exceed quantity_total';
  END IF;
  IF NEW.quantity_remaining < 0 THEN
    RAISE EXCEPTION 'quantity_remaining cannot be negative';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_auction_quantity_trigger
  BEFORE INSERT OR UPDATE ON auctions
  FOR EACH ROW
  WHEN (NEW.quantity_total IS NOT NULL AND NEW.quantity_remaining IS NOT NULL)
  EXECUTE FUNCTION validate_auction_quantity();

-- ============================================
-- COMMENTS for Documentation
-- ============================================

COMMENT ON TABLE auctions IS 'Core auction table with PRD v2.0 fields including material type, grade, and verification status';
COMMENT ON COLUMN auctions.auction_number IS 'Unique identifier format: AU-YYYYMMDD-XXX';
COMMENT ON COLUMN auctions.material_type IS 'VERIFIED FIELD: Type of lithium material (Carbonate/Hydroxide/Spodumene)';
COMMENT ON COLUMN auctions.grade IS 'VERIFIED FIELD: Purity grade (99%/99.5%/99.9%)';
COMMENT ON COLUMN auctions.verification_status IS 'Verification status for supplier claims - critical for data integrity';
COMMENT ON COLUMN auctions.quantity_remaining IS 'Remaining quantity available - supports multi-winner partial fulfillment';

COMMENT ON TABLE auction_documents IS 'Stores COA, certifications, test reports, and other verification documents';
-- V2: COMMENT ON COLUMN auction_documents.ipfs_hash IS 'IPFS hash for blockchain-verifiable document storage';

COMMENT ON TABLE auction_verifications IS 'Detailed verification audit trail (blockchain support in V2)';
-- V2: COMMENT ON COLUMN auction_verifications.blockchain_recorded IS 'Whether this verification is recorded on Ethereum blockchain';
-- V2: COMMENT ON COLUMN auction_verifications.blockchain_tx_hash IS 'Ethereum transaction hash for on-chain verification proof';

-- V2: COMMENT ON TABLE blockchain_verification_records IS 'Tracks on-chain verification transactions for audit and proof generation';
-- V2: COMMENT ON COLUMN blockchain_verification_records.verification_data_hash IS 'Hash of verification data stored on-chain for integrity verification';

COMMENT ON TABLE auction_winners IS 'Supports multi-winner partial fulfillment - multiple buyers can win portions of an auction';
COMMENT ON TABLE bid_history IS 'Complete audit trail of all bid changes for compliance and fraud detection';
COMMENT ON TABLE watchlist IS 'Buyers can watchlist auctions they are interested in';
COMMENT ON TABLE transactions IS 'Links winning bids to settlement workflow';
COMMENT ON TABLE kyc_verifications IS 'User KYC verification status and documents for platform access control';

