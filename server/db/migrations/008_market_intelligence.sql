-- Market Intelligence Tables
-- Migration 008: Real-time pricing, arbitrage, and market insights

-- Price data table (Real-time lithium pricing from Perplexity and other sources)
CREATE TABLE IF NOT EXISTS price_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type TEXT NOT NULL CHECK (product_type IN ('raw', 'compound', 'processed')),
  purity_level TEXT NOT NULL CHECK (purity_level IN ('99', '99.5', '99.9')),
  price_per_unit DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  unit TEXT NOT NULL DEFAULT 'ton',
  source TEXT NOT NULL, -- 'perplexity', 'metals_api', 'manual', etc.
  location_country TEXT,
  location_city TEXT,
  market_type TEXT CHECK (market_type IN ('spot', 'futures', 'contract', 'auction')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_price CHECK (price_per_unit > 0)
);

-- Arbitrage opportunities table (Detected arbitrage signals)
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type TEXT NOT NULL CHECK (product_type IN ('raw', 'compound', 'processed')),
  purity_level TEXT NOT NULL CHECK (purity_level IN ('99', '99.5', '99.9')),
  buy_location_country TEXT NOT NULL,
  buy_location_city TEXT,
  buy_price DECIMAL(12, 2) NOT NULL,
  buy_currency TEXT NOT NULL DEFAULT 'USD',
  sell_location_country TEXT NOT NULL,
  sell_location_city TEXT,
  sell_price DECIMAL(12, 2) NOT NULL,
  sell_currency TEXT NOT NULL DEFAULT 'USD',
  quantity_available DECIMAL(12, 2),
  estimated_profit DECIMAL(12, 2) NOT NULL,
  profit_margin_percentage DECIMAL(5, 2) NOT NULL,
  estimated_logistics_cost DECIMAL(12, 2),
  net_profit DECIMAL(12, 2),
  confidence_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'executed', 'invalid')),
  expires_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_profit CHECK (estimated_profit > 0)
);

-- Market news table (Aggregated news with sentiment)
CREATE TABLE IF NOT EXISTS market_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  source_name TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  sentiment_score DECIMAL(5, 2), -- -100 to 100 (negative to positive)
  sentiment_label TEXT CHECK (sentiment_label IN ('very_negative', 'negative', 'neutral', 'positive', 'very_positive')),
  relevance_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  keywords TEXT[],
  categories TEXT[], -- 'supply', 'demand', 'regulation', 'technology', etc.
  geographic_regions TEXT[],
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industry insights table (Processed insights for dashboard)
CREATE TABLE IF NOT EXISTS industry_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_type TEXT NOT NULL CHECK (insight_type IN ('price_trend', 'supply_chain', 'regulatory', 'technology', 'market_analysis')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content JSONB, -- Detailed insight data
  data_sources TEXT[], -- References to price_data, market_news, etc.
  confidence_level DECIMAL(5, 2) DEFAULT 0, -- 0-100
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  geographic_scope TEXT[],
  relevant_product_types TEXT[],
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price alerts table (User-configured price alerts)
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('raw', 'compound', 'processed')),
  purity_level TEXT CHECK (purity_level IN ('99', '99.5', '99.9')),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below', 'change_percent', 'arbitrage')),
  target_price DECIMAL(12, 2),
  change_percent DECIMAL(5, 2),
  location_country TEXT,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  notification_method TEXT[] DEFAULT ARRAY['email'], -- 'email', 'push', 'sms'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily market briefings table
CREATE TABLE IF NOT EXISTS market_briefings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  briefing_date DATE NOT NULL,
  briefing_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary TEXT NOT NULL,
  key_highlights JSONB NOT NULL,
  price_summary JSONB, -- Price changes, trends
  news_summary JSONB, -- Top news items
  arbitrage_opportunities JSONB, -- Top opportunities
  regulatory_updates JSONB,
  generated_by TEXT DEFAULT 'perplexity_ai',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(briefing_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_data_product ON price_data(product_type, purity_level);
CREATE INDEX IF NOT EXISTS idx_price_data_timestamp ON price_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_data_location ON price_data(location_country, location_city);
CREATE INDEX IF NOT EXISTS idx_price_data_source ON price_data(source);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_status ON arbitrage_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_profit ON arbitrage_opportunities(estimated_profit DESC);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_expires ON arbitrage_opportunities(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_market_news_published ON market_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_news_sentiment ON market_news(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_market_news_relevance ON market_news(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_industry_insights_type ON industry_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_industry_insights_generated ON industry_insights(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_market_briefings_date ON market_briefings(briefing_date DESC);

-- Update triggers
CREATE TRIGGER update_arbitrage_opportunities_updated_at BEFORE UPDATE ON arbitrage_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industry_insights_updated_at BEFORE UPDATE ON industry_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


