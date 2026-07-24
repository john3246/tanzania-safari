-- ── Media Library Production PostgreSQL Schema for Render ──────────────────────
-- Run this SQL DDL script manually in your Render PostgreSQL console or psql terminal if needed.

CREATE TABLE IF NOT EXISTS media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    url VARCHAR(500) NOT NULL UNIQUE,
    slug VARCHAR(255),
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT 'image/jpeg',
    folder VARCHAR(255) DEFAULT 'public/images',
    alt_text TEXT,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_url ON media_library(url);
CREATE INDEX IF NOT EXISTS idx_media_slug ON media_library(slug);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder);

-- Ensure all required columns exist on existing tables
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS alt_text TEXT;
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
