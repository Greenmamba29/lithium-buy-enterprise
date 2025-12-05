-- Row Level Security (RLS) Policies for LithiumBuy Enterprise
-- Ensures data access is controlled at the database level

-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE telebuy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telebuy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Suppliers: Public read, authenticated write
CREATE POLICY "Suppliers are viewable by everyone"
  ON suppliers FOR SELECT
  USING (true);

CREATE POLICY "Suppliers are insertable by authenticated users"
  ON suppliers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Suppliers are updatable by owners or admins"
  ON suppliers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Supplier profiles: Public read, authenticated write
CREATE POLICY "Supplier profiles are viewable by everyone"
  ON supplier_profiles FOR SELECT
  USING (true);

CREATE POLICY "Supplier profiles are insertable by authenticated users"
  ON supplier_profiles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Supplier profiles are updatable by owners or admins"
  ON supplier_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Locations: Public read, authenticated write
CREATE POLICY "Locations are viewable by everyone"
  ON locations FOR SELECT
  USING (true);

CREATE POLICY "Locations are insertable by authenticated users"
  ON locations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Products: Public read, authenticated write
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by owners or admins"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Certifications: Public read, authenticated write
CREATE POLICY "Certifications are viewable by everyone"
  ON certifications FOR SELECT
  USING (true);

CREATE POLICY "Certifications are insertable by authenticated users"
  ON certifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reviews: Public read, authenticated write (own reviews)
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Reviews are insertable by authenticated users"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Quotes: Users can see their own quotes, suppliers see quotes for their suppliers
CREATE POLICY "Users can view their own quotes"
  ON quotes FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM suppliers
      WHERE suppliers.id = quotes.supplier_id
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role IN ('supplier', 'admin')
      )
    )
  );

CREATE POLICY "Authenticated users can create quotes"
  ON quotes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes"
  ON quotes FOR UPDATE
  USING (auth.uid() = user_id);

-- Orders: Users can see their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM suppliers
      WHERE suppliers.id = orders.supplier_id
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role IN ('supplier', 'admin')
      )
    )
  );

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

-- TELEBUY sessions: Participants can see their sessions
CREATE POLICY "Users can view their own TELEBUY sessions"
  ON telebuy_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM suppliers
      WHERE suppliers.id = telebuy_sessions.supplier_id
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role IN ('supplier', 'admin')
      )
    )
  );

CREATE POLICY "Authenticated users can create TELEBUY sessions"
  ON telebuy_sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own TELEBUY sessions"
  ON telebuy_sessions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM suppliers
      WHERE suppliers.id = telebuy_sessions.supplier_id
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role IN ('supplier', 'admin')
      )
    )
  );

-- TELEBUY documents: Same as sessions
CREATE POLICY "Users can view documents for their sessions"
  ON telebuy_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM telebuy_sessions
      WHERE telebuy_sessions.id = telebuy_documents.session_id
      AND (
        telebuy_sessions.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM suppliers
          WHERE suppliers.id = telebuy_sessions.supplier_id
          AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role IN ('supplier', 'admin')
          )
        )
      )
    )
  );

CREATE POLICY "Authenticated users can create documents"
  ON telebuy_documents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update documents for their sessions"
  ON telebuy_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM telebuy_sessions
      WHERE telebuy_sessions.id = telebuy_documents.session_id
      AND (
        telebuy_sessions.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM suppliers
          WHERE suppliers.id = telebuy_sessions.supplier_id
          AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role IN ('supplier', 'admin')
          )
        )
      )
    )
  );

-- User profiles: Users can see their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'admin'
    )
  );




