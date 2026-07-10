-- Add site_images table for image management system
CREATE TABLE IF NOT EXISTS site_images (
    id          SERIAL PRIMARY KEY,
    filename    VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    path        VARCHAR(500) NOT NULL,
    alt_text    TEXT,
    entity_type VARCHAR(50),
    entity_id   INTEGER,
    uploaded_by INTEGER,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_images_slug       ON site_images(slug);
CREATE INDEX IF NOT EXISTS idx_site_images_entity     ON site_images(entity_type, entity_id);

-- Add contact enquiries newsletter support
ALTER TABLE contact_enquiries ALTER COLUMN enquiry_type SET DEFAULT 'General';

-- Ensure newsletter subscribe endpoint works
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active  BOOLEAN DEFAULT TRUE
);

-- Add contact endpoint alias mapping
-- /api/contact → saves to contact_enquiries
-- /api/newsletter → saves to newsletter_subscribers
