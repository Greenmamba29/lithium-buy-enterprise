-- Auction Marketplace Tables
-- Migration 006: Live auction and bidding system

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  auction_type TEXT NOT NULL CHECK (auction_type IN ('english', 'dutch', 'sealed_bid', 'reverse')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'cancelled')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reserve_price DECIMAL(12, 2),
  starting_price DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  bid_increment DECIMAL(12, 2) NOT NULL DEFAULT 100.00,
  current_bid DECIMAL(12, 2),
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Auction lots table (individual items within an auction)
CREATE TABLE IF NOT EXISTS auction_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  lot_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(12, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ton',
  product_type TEXT CHECK (product_type IN ('raw', 'compound', 'processed')),
  purity_level TEXT CHECK (purity_level IN ('99', '99.5', '99.9')),
  location_country TEXT,
  location_city TEXT,
  certification_required BOOLEAN DEFAULT false,
  min_purity_required TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(auction_id, lot_number)
);

-- Bids table (real-time bidding data)
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES auction_lots(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_winning BOOLEAN DEFAULT false,
  is_retracted BOOLEAN DEFAULT false,
  retracted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_bid CHECK (amount > 0)
);

-- Escrow accounts table (payment escrow management)
CREATE TABLE IF NOT EXISTS escrow_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'released', 'refunded', 'disputed')),
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  funded_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logistics options table (shipping/logistics integration)
CREATE TABLE IF NOT EXISTS logistics_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('standard', 'express', 'overnight', 'custom')),
  estimated_days INTEGER,
  cost DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  tracking_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'in_transit', 'delivered', 'cancelled')),
  origin_country TEXT,
  origin_city TEXT,
  destination_country TEXT NOT NULL,
  destination_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_time_range ON auctions(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_auction_lots_auction ON auction_lots(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_winning ON bids(auction_id, is_winning) WHERE is_winning = true;
CREATE INDEX IF NOT EXISTS idx_escrow_auction ON escrow_accounts(auction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_order ON escrow_accounts(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_accounts(status);
CREATE INDEX IF NOT EXISTS idx_logistics_auction ON logistics_options(auction_id);
CREATE INDEX IF NOT EXISTS idx_logistics_order ON logistics_options(order_id);

-- Update triggers
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_lots_updated_at BEFORE UPDATE ON auction_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_accounts_updated_at BEFORE UPDATE ON escrow_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_options_updated_at BEFORE UPDATE ON logistics_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


