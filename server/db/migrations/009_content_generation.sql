-- Content Generation Tables
-- Migration 009: Ebook, blog, and content generation system

-- Content templates table (Ebook/blog templates)
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('ebook', 'blog', 'report', 'newsletter', 'whitepaper')),
  description TEXT,
  structure JSONB NOT NULL, -- Template structure with sections, placeholders
  variables JSONB, -- Available template variables
  default_content JSONB, -- Default content for each section
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated content table (AI-generated content pieces)
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES content_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('ebook', 'blog', 'report', 'newsletter', 'whitepaper')),
  content JSONB NOT NULL, -- Structured content (sections, paragraphs, etc.)
  raw_content TEXT, -- Full text content
  metadata JSONB, -- Author, tags, categories, etc.
  source_data JSONB, -- References to market reports, market data, etc.
  ai_model TEXT, -- 'perplexity', 'gemini', 'gpt-4', etc.
  generation_prompt TEXT,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content sources table (Accio report data for content)
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL CHECK (source_type IN ('market_report', 'market_data', 'news_article', 'user_input', 'api_feed')),
  source_identifier TEXT NOT NULL, -- URL, file path, API endpoint, etc.
  title TEXT,
  description TEXT,
  raw_data JSONB, -- Original source data
  extracted_data JSONB, -- Processed/extracted data for content generation
  metadata JSONB, -- Source metadata (date, author, etc.)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_type, source_identifier)
);

-- Content publishing table (Publishing workflow)
CREATE TABLE IF NOT EXISTS content_publishing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'website', 'medium', 'linkedin', 'pdf', 'epub', etc.
  platform_url TEXT,
  platform_id TEXT, -- External platform content ID
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'publishing', 'published', 'failed')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  publish_metadata JSONB, -- Platform-specific metadata
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content analytics table (Track content performance)
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  reads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2), -- Percentage
  average_read_time_seconds INTEGER,
  bounce_rate DECIMAL(5, 2), -- Percentage
  conversion_count INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, platform, period_start, period_end)
);

-- Content versioning table (Track content revisions)
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  change_summary TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, version_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_templates_type ON content_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_content_templates_active ON content_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_by ON generated_content(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_content_published ON generated_content(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_content_sources_type ON content_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_content_sources_active ON content_sources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_content_publishing_content ON content_publishing(content_id);
CREATE INDEX IF NOT EXISTS idx_content_publishing_status ON content_publishing(status);
CREATE INDEX IF NOT EXISTS idx_content_publishing_platform ON content_publishing(platform);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON content_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_content_versions_content ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_number ON content_versions(content_id, version_number DESC);

-- Update triggers
CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_sources_updated_at BEFORE UPDATE ON content_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_publishing_updated_at BEFORE UPDATE ON content_publishing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_analytics_updated_at BEFORE UPDATE ON content_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


