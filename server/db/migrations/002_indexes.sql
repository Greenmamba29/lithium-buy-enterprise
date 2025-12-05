-- Performance indexes for LithiumBuy Enterprise
-- Optimizes common query patterns

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_verification_tier ON suppliers(verification_tier);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON suppliers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at DESC);

-- Full-text search on supplier names
CREATE INDEX IF NOT EXISTS idx_suppliers_name_trgm ON suppliers USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_description_trgm ON supplier_profiles USING gin(description gin_trgm_ops);

-- Location indexes
CREATE INDEX IF NOT EXISTS idx_locations_supplier_id ON locations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country);
CREATE INDEX IF NOT EXISTS idx_locations_primary ON locations(supplier_id, is_primary) WHERE is_primary = true;

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_purity ON products(purity_level);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price_per_unit);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);
CREATE INDEX IF NOT EXISTS idx_products_type_purity_price ON products(product_type, purity_level, price_per_unit);

-- Composite index for common filtering
CREATE INDEX IF NOT EXISTS idx_products_filtering ON products(supplier_id, product_type, purity_level, availability, price_per_unit);

-- Certifications indexes
CREATE INDEX IF NOT EXISTS idx_certifications_supplier_id ON certifications(supplier_id);
CREATE INDEX IF NOT EXISTS idx_certifications_type ON certifications(certification_type);
CREATE INDEX IF NOT EXISTS idx_certifications_expiry ON certifications(expiry_date) WHERE expiry_date IS NOT NULL;

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_supplier_id ON reviews(supplier_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_supplier_rating ON reviews(supplier_id, rating DESC);

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_supplier_id ON quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_expires_at ON quotes(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_user_status ON quotes(user_id, status);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- TELEBUY sessions indexes
CREATE INDEX IF NOT EXISTS idx_telebuy_sessions_supplier_id ON telebuy_sessions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_telebuy_sessions_user_id ON telebuy_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_telebuy_sessions_status ON telebuy_sessions(status);
CREATE INDEX IF NOT EXISTS idx_telebuy_sessions_scheduled_at ON telebuy_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_telebuy_sessions_user_status ON telebuy_sessions(user_id, status);

-- TELEBUY documents indexes
CREATE INDEX IF NOT EXISTS idx_telebuy_documents_session_id ON telebuy_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_telebuy_documents_type ON telebuy_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_telebuy_documents_signed_at ON telebuy_documents(signed_at) WHERE signed_at IS NOT NULL;

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company ON user_profiles(company_name);

-- GIN index for array fields (specialties)
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_specialties ON supplier_profiles USING gin(specialties);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_quotes_active ON quotes(supplier_id, status) WHERE status IN ('pending', 'accepted');
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(user_id, status) WHERE status NOT IN ('cancelled', 'delivered');




