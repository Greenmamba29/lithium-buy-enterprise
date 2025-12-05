-- Procurement Platform Tables
-- Migration 007: RFQ, tenders, and procurement management

-- RFQs table (Request for Quote management)
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'awarded', 'cancelled')),
  product_type TEXT NOT NULL CHECK (product_type IN ('raw', 'compound', 'processed')),
  purity_level TEXT NOT NULL CHECK (purity_level IN ('99', '99.5', '99.9')),
  quantity DECIMAL(12, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ton',
  target_price DECIMAL(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  delivery_location_country TEXT NOT NULL,
  delivery_location_city TEXT,
  required_certifications TEXT[],
  deadline TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  awarded_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQ responses table (Supplier responses to RFQs)
CREATE TABLE IF NOT EXISTS rfq_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_price DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  delivery_time_days INTEGER,
  payment_terms TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'rejected', 'accepted')),
  score DECIMAL(5, 2), -- Automated scoring (0-100)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, supplier_id)
);

-- Tenders table (Tender/negotiation management)
CREATE TABLE IF NOT EXISTS tenders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'negotiating', 'closed', 'awarded')),
  total_value DECIMAL(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  deadline TIMESTAMPTZ NOT NULL,
  negotiation_round INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts table (Contract generation and tracking)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE SET NULL,
  tender_id UUID REFERENCES tenders(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('purchase', 'supply', 'service', 'framework')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'active', 'completed', 'terminated')),
  template_id UUID, -- Reference to contract template
  content JSONB NOT NULL, -- Contract terms and clauses
  version INTEGER DEFAULT 1,
  signed_by_buyer_at TIMESTAMPTZ,
  signed_by_supplier_at TIMESTAMPTZ,
  docusign_envelope_id TEXT,
  effective_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procurement analytics table (Supplier performance metrics)
CREATE TABLE IF NOT EXISTS procurement_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_rfqs_received INTEGER DEFAULT 0,
  total_rfqs_responded INTEGER DEFAULT 0,
  response_rate DECIMAL(5, 2), -- Percentage
  average_response_time_hours DECIMAL(10, 2),
  total_contracts_awarded INTEGER DEFAULT 0,
  total_contract_value DECIMAL(12, 2) DEFAULT 0,
  on_time_delivery_rate DECIMAL(5, 2), -- Percentage
  quality_score DECIMAL(5, 2), -- 0-100
  reliability_score DECIMAL(5, 2), -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, period_start, period_end)
);

-- Communication threads for RFQs
CREATE TABLE IF NOT EXISTS rfq_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  response_id UUID REFERENCES rfq_responses(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false, -- Internal notes not visible to other party
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_deadline ON rfqs(deadline);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_rfq ON rfq_responses(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_supplier ON rfq_responses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_status ON rfq_responses(status);
CREATE INDEX IF NOT EXISTS idx_tenders_buyer ON tenders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_contracts_buyer ON contracts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_supplier ON contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_procurement_analytics_supplier ON procurement_analytics(supplier_id);
CREATE INDEX IF NOT EXISTS idx_procurement_analytics_period ON procurement_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_rfq_communications_rfq ON rfq_communications(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_communications_response ON rfq_communications(response_id);

-- Update triggers
CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfq_responses_updated_at BEFORE UPDATE ON rfq_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_analytics_updated_at BEFORE UPDATE ON procurement_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


