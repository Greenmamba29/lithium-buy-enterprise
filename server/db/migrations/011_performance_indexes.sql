-- Performance Optimization Indexes
-- Migration 011: Additional indexes for query optimization
-- Focuses on new tables and common query patterns

-- ============================================
-- Auction Marketplace Indexes
-- ============================================

-- Auctions: Status and time-based queries
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_seller_id ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_start_time ON auctions(start_time);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_status_time ON auctions(status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_live ON auctions(status, start_time, end_time) 
  WHERE status = 'live' AND start_time <= NOW() AND end_time >= NOW();
CREATE INDEX IF NOT EXISTS idx_auctions_scheduled ON auctions(status, start_time) 
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_auctions_ended ON auctions(status, end_time) 
  WHERE status = 'ended';

-- Auction lots: Common filtering patterns
CREATE INDEX IF NOT EXISTS idx_auction_lots_auction_id ON auction_lots(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_lots_product_type ON auction_lots(product_type);
CREATE INDEX IF NOT EXISTS idx_auction_lots_purity ON auction_lots(purity_level);
CREATE INDEX IF NOT EXISTS idx_auction_lots_location ON auction_lots(location_country, location_city);

-- Bids: Real-time bidding queries
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_lot_id ON bids(lot_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_winning ON bids(auction_id, is_winning) WHERE is_winning = true;
CREATE INDEX IF NOT EXISTS idx_bids_auction_created ON bids(auction_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_active ON bids(auction_id, is_retracted, created_at DESC) 
  WHERE is_retracted = false;

-- Escrow accounts: Status and payment tracking
CREATE INDEX IF NOT EXISTS idx_escrow_auction_id ON escrow_accounts(auction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_order_id ON escrow_accounts(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer_id ON escrow_accounts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller_id ON escrow_accounts(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_accounts(status);
CREATE INDEX IF NOT EXISTS idx_escrow_pending ON escrow_accounts(status, created_at) 
  WHERE status = 'pending';

-- Logistics options: Status and location queries
CREATE INDEX IF NOT EXISTS idx_logistics_auction_id ON logistics_options(auction_id);
CREATE INDEX IF NOT EXISTS idx_logistics_order_id ON logistics_options(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_status ON logistics_options(status);
CREATE INDEX IF NOT EXISTS idx_logistics_destination ON logistics_options(destination_country, destination_city);
CREATE INDEX IF NOT EXISTS idx_logistics_active ON logistics_options(status, created_at) 
  WHERE status IN ('booked', 'in_transit');

-- ============================================
-- Procurement Platform Indexes
-- ============================================

-- RFQs: Status and deadline queries
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_deadline ON rfqs(deadline);
CREATE INDEX IF NOT EXISTS idx_rfqs_product_type ON rfqs(product_type);
CREATE INDEX IF NOT EXISTS idx_rfqs_purity ON rfqs(purity_level);
CREATE INDEX IF NOT EXISTS idx_rfqs_status_deadline ON rfqs(status, deadline);
CREATE INDEX IF NOT EXISTS idx_rfqs_published ON rfqs(status, published_at) 
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_rfqs_active ON rfqs(status, deadline) 
  WHERE status IN ('published', 'closed') AND deadline >= NOW();

-- RFQ responses: Supplier and status queries
CREATE INDEX IF NOT EXISTS idx_rfq_responses_rfq_id ON rfq_responses(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_supplier_id ON rfq_responses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_user_id ON rfq_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_status ON rfq_responses(status);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_score ON rfq_responses(rfq_id, score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_submitted ON rfq_responses(rfq_id, status, created_at) 
  WHERE status = 'submitted';

-- Tenders: Status and deadline queries
CREATE INDEX IF NOT EXISTS idx_tenders_buyer_id ON tenders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(deadline);
CREATE INDEX IF NOT EXISTS idx_tenders_active ON tenders(status, deadline) 
  WHERE status IN ('open', 'negotiating');

-- Contracts: Status and relationship queries
CREATE INDEX IF NOT EXISTS idx_contracts_rfq_id ON contracts(rfq_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tender_id ON contracts(tender_id);
CREATE INDEX IF NOT EXISTS idx_contracts_order_id ON contracts(order_id);
CREATE INDEX IF NOT EXISTS idx_contracts_buyer_id ON contracts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_supplier_id ON contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_pending_signature ON contracts(status, created_at) 
  WHERE status = 'pending_signature';
CREATE INDEX IF NOT EXISTS idx_contracts_active ON contracts(status, effective_date, expiry_date) 
  WHERE status = 'active';

-- Procurement analytics: Time-based and supplier queries
CREATE INDEX IF NOT EXISTS idx_procurement_analytics_supplier_id ON procurement_analytics(supplier_id);
CREATE INDEX IF NOT EXISTS idx_procurement_analytics_period ON procurement_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_procurement_analytics_recent ON procurement_analytics(supplier_id, period_end DESC);

-- RFQ communications: Thread and participant queries
CREATE INDEX IF NOT EXISTS idx_rfq_communications_rfq_id ON rfq_communications(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_communications_participant_id ON rfq_communications(participant_id);
CREATE INDEX IF NOT EXISTS idx_rfq_communications_thread_id ON rfq_communications(thread_id);
CREATE INDEX IF NOT EXISTS idx_rfq_communications_created ON rfq_communications(rfq_id, created_at DESC);

-- ============================================
-- Market Intelligence Indexes
-- ============================================

-- Price data: Time-series and product queries
CREATE INDEX IF NOT EXISTS idx_price_data_product_type ON price_data(product_type);
CREATE INDEX IF NOT EXISTS idx_price_data_purity ON price_data(purity_level);
CREATE INDEX IF NOT EXISTS idx_price_data_location ON price_data(location_country, location_city);
CREATE INDEX IF NOT EXISTS idx_price_data_timestamp ON price_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_data_source ON price_data(source);
CREATE INDEX IF NOT EXISTS idx_price_data_recent ON price_data(product_type, purity_level, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_data_location_recent ON price_data(location_country, product_type, timestamp DESC);

-- Arbitrage opportunities: Status and profit queries
CREATE INDEX IF NOT EXISTS idx_arbitrage_status ON arbitrage_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_arbitrage_profit ON arbitrage_opportunities(estimated_profit DESC);
CREATE INDEX IF NOT EXISTS idx_arbitrage_active ON arbitrage_opportunities(status, detected_at) 
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_arbitrage_recent ON arbitrage_opportunities(detected_at DESC);

-- Market news: Time and sentiment queries
CREATE INDEX IF NOT EXISTS idx_market_news_published_at ON market_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_news_sentiment ON market_news(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_market_news_source ON market_news(source);
CREATE INDEX IF NOT EXISTS idx_market_news_recent ON market_news(published_at DESC) 
  WHERE published_at >= NOW() - INTERVAL '30 days';

-- Industry insights: Category and date queries
CREATE INDEX IF NOT EXISTS idx_industry_insights_category ON industry_insights(category);
CREATE INDEX IF NOT EXISTS idx_industry_insights_date ON industry_insights(insight_date DESC);
CREATE INDEX IF NOT EXISTS idx_industry_insights_recent ON industry_insights(category, insight_date DESC);

-- Price alerts: User and status queries
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_status ON price_alerts(status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(user_id, status) 
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_price_alerts_triggered ON price_alerts(status, triggered_at) 
  WHERE status = 'triggered';

-- Market briefings: Date queries
CREATE INDEX IF NOT EXISTS idx_market_briefings_date ON market_briefings(briefing_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_briefings_recent ON market_briefings(briefing_date DESC) 
  WHERE briefing_date >= NOW() - INTERVAL '7 days';

-- ============================================
-- Content Generation Indexes
-- ============================================

-- Generated content: Status and type queries
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_created ON generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_published ON generated_content(status, published_at) 
  WHERE status = 'published';

-- Content publishing: Platform and status queries
CREATE INDEX IF NOT EXISTS idx_content_publishing_content_id ON content_publishing(content_id);
CREATE INDEX IF NOT EXISTS idx_content_publishing_platform ON content_publishing(platform);
CREATE INDEX IF NOT EXISTS idx_content_publishing_status ON content_publishing(status);
CREATE INDEX IF NOT EXISTS idx_content_publishing_published ON content_publishing(platform, published_at DESC);

-- Content analytics: Time-based queries
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date ON content_analytics(analytics_date DESC);

-- ============================================
-- Composite Indexes for Common Query Patterns
-- ============================================

-- Auctions: Seller's active auctions
CREATE INDEX IF NOT EXISTS idx_auctions_seller_active ON auctions(seller_id, status, end_time) 
  WHERE status IN ('scheduled', 'live');

-- Bids: Latest bids per auction
CREATE INDEX IF NOT EXISTS idx_bids_auction_latest ON bids(auction_id, created_at DESC, is_retracted) 
  WHERE is_retracted = false;

-- RFQs: Buyer's active RFQs
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_active ON rfqs(buyer_id, status, deadline) 
  WHERE status IN ('published', 'closed');

-- RFQ responses: Best responses per RFQ
CREATE INDEX IF NOT EXISTS idx_rfq_responses_best ON rfq_responses(rfq_id, score DESC, status) 
  WHERE status IN ('submitted', 'shortlisted');

-- Contracts: Active contracts by party
CREATE INDEX IF NOT EXISTS idx_contracts_buyer_active ON contracts(buyer_id, status, expiry_date) 
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_contracts_supplier_active ON contracts(supplier_id, status, expiry_date) 
  WHERE status = 'active';

-- ============================================
-- Full-Text Search Indexes (if pg_trgm extension available)
-- ============================================

-- Enable pg_trgm extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search on auction titles and descriptions
-- CREATE INDEX IF NOT EXISTS idx_auctions_title_trgm ON auctions USING gin(title gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_auctions_description_trgm ON auctions USING gin(description gin_trgm_ops);

-- Full-text search on RFQ titles and descriptions
-- CREATE INDEX IF NOT EXISTS idx_rfqs_title_trgm ON rfqs USING gin(title gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_rfqs_description_trgm ON rfqs USING gin(description gin_trgm_ops);

-- Full-text search on market news
-- CREATE INDEX IF NOT EXISTS idx_market_news_title_trgm ON market_news USING gin(title gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_market_news_content_trgm ON market_news USING gin(content gin_trgm_ops);

-- ============================================
-- Statistics Update
-- ============================================

-- Update table statistics for query planner
ANALYZE auctions;
ANALYZE auction_lots;
ANALYZE bids;
ANALYZE escrow_accounts;
ANALYZE logistics_options;
ANALYZE rfqs;
ANALYZE rfq_responses;
ANALYZE tenders;
ANALYZE contracts;
ANALYZE procurement_analytics;
ANALYZE price_data;
ANALYZE arbitrage_opportunities;
ANALYZE market_news;
ANALYZE industry_insights;
ANALYZE price_alerts;
ANALYZE market_briefings;
ANALYZE generated_content;
ANALYZE content_publishing;
ANALYZE content_analytics;


