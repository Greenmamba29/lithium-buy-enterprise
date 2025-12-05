-- Row Level Security (RLS) Policies for New Tables
-- Migration 010: RLS policies for auctions, procurement, intelligence, and content tables

-- Enable RLS on all new tables
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE arbitrage_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_publishing ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUCTION TABLES
-- ============================================

-- Auctions: Public read for active auctions, authenticated write
CREATE POLICY "Auctions are viewable by everyone"
  ON auctions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create auctions"
  ON auctions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own auctions"
  ON auctions FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can update any auction"
  ON auctions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Auction lots: Public read, authenticated write
CREATE POLICY "Auction lots are viewable by everyone"
  ON auction_lots FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create lots for their auctions"
  ON auction_lots FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM auctions
      WHERE auctions.id = auction_lots.auction_id
      AND auctions.seller_id = auth.uid()
    )
  );

-- Bids: Users can see bids for auctions they're participating in
CREATE POLICY "Users can view bids for auctions they're in"
  ON bids FOR SELECT
  USING (
    bidder_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auctions
      WHERE auctions.id = bids.auction_id
      AND auctions.seller_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM auctions
      WHERE auctions.id = bids.auction_id
      AND auctions.status IN ('live', 'ended')
    )
  );

CREATE POLICY "Authenticated users can place bids"
  ON bids FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = bidder_id
    AND EXISTS (
      SELECT 1 FROM auctions
      WHERE auctions.id = bids.auction_id
      AND auctions.status = 'live'
      AND auctions.seller_id != auth.uid()
    )
  );

-- Escrow accounts: Only buyer and seller can view
CREATE POLICY "Buyers and sellers can view their escrow accounts"
  ON escrow_accounts FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create escrow accounts"
  ON escrow_accounts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = buyer_id);

CREATE POLICY "Buyers and sellers can update their escrow accounts"
  ON escrow_accounts FOR UPDATE
  USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Logistics options: Public read, authenticated write
CREATE POLICY "Logistics options are viewable by everyone"
  ON logistics_options FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create logistics options"
  ON logistics_options FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- PROCUREMENT TABLES
-- ============================================

-- RFQs: Buyers can see their own, suppliers can see published ones
CREATE POLICY "Buyers can view their own RFQs"
  ON rfqs FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Suppliers can view published RFQs"
  ON rfqs FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('supplier', 'admin')
    )
  );

CREATE POLICY "Authenticated users can create RFQs"
  ON rfqs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own RFQs"
  ON rfqs FOR UPDATE
  USING (buyer_id = auth.uid());

-- RFQ responses: Buyers and responding suppliers can view
CREATE POLICY "Buyers can view responses to their RFQs"
  ON rfq_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_responses.rfq_id
      AND rfqs.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can view their own responses"
  ON rfq_responses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated suppliers can create responses"
  ON rfq_responses FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_responses.rfq_id
      AND rfqs.status = 'published'
    )
  );

-- Tenders: Similar to RFQs
CREATE POLICY "Buyers can view their own tenders"
  ON tenders FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Authenticated users can create tenders"
  ON tenders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = buyer_id);

-- Contracts: Buyers and suppliers can view their contracts
CREATE POLICY "Buyers and suppliers can view their contracts"
  ON contracts FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR supplier_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = buyer_id);

-- Procurement analytics: Suppliers can view their own
CREATE POLICY "Suppliers can view their own analytics"
  ON procurement_analytics FOR SELECT
  USING (
    supplier_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RFQ communications: Participants can view
CREATE POLICY "RFQ participants can view communications"
  ON rfq_communications FOR SELECT
  USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_communications.rfq_id
      AND rfqs.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create communications"
  ON rfq_communications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = sender_id);

-- ============================================
-- MARKET INTELLIGENCE TABLES
-- ============================================

-- Price data: Public read, admin write
CREATE POLICY "Price data is viewable by everyone"
  ON price_data FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert price data"
  ON price_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Arbitrage opportunities: Public read, admin write
CREATE POLICY "Arbitrage opportunities are viewable by everyone"
  ON arbitrage_opportunities FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert arbitrage opportunities"
  ON arbitrage_opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Market news: Public read, admin write
CREATE POLICY "Market news is viewable by everyone"
  ON market_news FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert market news"
  ON market_news FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Industry insights: Public read, admin write
CREATE POLICY "Industry insights are viewable by everyone"
  ON industry_insights FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert industry insights"
  ON industry_insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Price alerts: Users can view and manage their own
CREATE POLICY "Users can view their own price alerts"
  ON price_alerts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create price alerts"
  ON price_alerts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts"
  ON price_alerts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own price alerts"
  ON price_alerts FOR DELETE
  USING (user_id = auth.uid());

-- Market briefings: Public read, admin write
CREATE POLICY "Market briefings are viewable by everyone"
  ON market_briefings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert market briefings"
  ON market_briefings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- CONTENT GENERATION TABLES
-- ============================================

-- Content templates: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view active templates"
  ON content_templates FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage templates"
  ON content_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Generated content: Users can view published, creators can manage their own
CREATE POLICY "Users can view published content"
  ON generated_content FOR SELECT
  USING (
    status = 'published'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create content"
  ON generated_content FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Users can update their own content"
  ON generated_content FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Content sources: Admins can manage
CREATE POLICY "Only admins can view content sources"
  ON content_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage content sources"
  ON content_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Content publishing: Content creators and admins can view
CREATE POLICY "Content creators can view their publishing records"
  ON content_publishing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM generated_content
      WHERE generated_content.id = content_publishing.content_id
      AND generated_content.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create publishing records"
  ON content_publishing FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM generated_content
      WHERE generated_content.id = content_publishing.content_id
      AND generated_content.created_by = auth.uid()
    )
  );

-- Content analytics: Public read for published content
CREATE POLICY "Users can view analytics for published content"
  ON content_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM generated_content
      WHERE generated_content.id = content_analytics.content_id
      AND (
        generated_content.status = 'published'
        OR generated_content.created_by = auth.uid()
      )
    )
  );

-- Content versions: Content creators can view
CREATE POLICY "Content creators can view versions"
  ON content_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM generated_content
      WHERE generated_content.id = content_versions.content_id
      AND generated_content.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "System can create content versions"
  ON content_versions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


