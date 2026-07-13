-- 02_cms_full_schema.sql
-- Complete CMS schema for Tours, Categories, Destinations, Media, Pages, Menus, SEO

-- Tour Categories
CREATE TABLE IF NOT EXISTS tour_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tour_categories_slug ON tour_categories(slug);
CREATE INDEX IF NOT EXISTS idx_tour_categories_active ON tour_categories(is_active) WHERE deleted_at IS NULL;

-- Destinations
CREATE TABLE IF NOT EXISTS destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    country VARCHAR(100) DEFAULT 'Tanzania',
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    featured_image_url VARCHAR(500),
    gallery_urls JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_destinations_slug ON destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(is_featured) WHERE is_active = TRUE AND deleted_at IS NULL;

-- Tours (Safari Packages)
CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    overview TEXT,
    description TEXT,
    price_usd DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    duration_nights INTEGER,
    category_id INTEGER REFERENCES tour_categories(id) ON DELETE SET NULL,
    destination_id INTEGER REFERENCES destinations(id) ON DELETE SET NULL,
    difficulty VARCHAR(50) DEFAULT 'Easy',
    group_size_min INTEGER DEFAULT 1,
    group_size_max INTEGER,
    age_minimum INTEGER DEFAULT 0,
    highlights JSONB DEFAULT '[]',
    included JSONB DEFAULT '[]',
    excluded JSONB DEFAULT '[]',
    travel_tips JSONB DEFAULT '[]',
    itinerary JSONB DEFAULT '[]',
    faqs JSONB DEFAULT '[]',
    featured_image_url VARCHAR(500),
    gallery_urls JSONB DEFAULT '[]',
    gallery_order JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'draft',
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    meta_robots VARCHAR(100),
    canonical_url VARCHAR(500),
    og_title VARCHAR(255),
    og_description TEXT,
    og_image_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured) WHERE is_active = TRUE AND deleted_at IS NULL;

-- Related Tours
CREATE TABLE IF NOT EXISTS related_tours (
    tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    related_tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    PRIMARY KEY (tour_id, related_tour_id),
    CHECK (tour_id != related_tour_id)
);

-- Media Library
CREATE TABLE IF NOT EXISTS media_library (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    path VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    webp_url VARCHAR(500),
    alt_text TEXT,
    caption TEXT,
    folder VARCHAR(255) DEFAULT 'root',
    tags JSONB DEFAULT '[]',
    entity_type VARCHAR(50),
    entity_id INTEGER,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_media_entity ON media_library(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_media_tags ON media_library USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_media_uploaded ON media_library(uploaded_by) WHERE deleted_at IS NULL;

-- Pages (CMS Pages)
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    featured_image_url VARCHAR(500),
    template VARCHAR(100) DEFAULT 'default',
    status VARCHAR(50) DEFAULT 'draft',
    is_homepage BOOLEAN DEFAULT FALSE,
    parent_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    meta_robots VARCHAR(100),
    canonical_url VARCHAR(500),
    og_title VARCHAR(255),
    og_description TEXT,
    og_image_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pages_homepage ON pages(is_homepage) WHERE deleted_at IS NULL;

-- Menus
CREATE TABLE IF NOT EXISTS menus (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_code ON menus(code);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
    target VARCHAR(50) DEFAULT '_self',
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_page ON menu_items(page_id);

-- Newsletter Subscribers (already exists, ensure structure)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_code ON email_templates(code);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    template_code VARCHAR(100) REFERENCES email_templates(code) ON DELETE SET NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    status VARCHAR(50) DEFAULT 'queued',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_to ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_code);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    booking_id INTEGER,
    tour_id INTEGER REFERENCES tours(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Bookings (ensure full structure)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    tour_id INTEGER REFERENCES tours(id) ON DELETE SET NULL,
    package_name VARCHAR(255),
    start_date DATE,
    number_of_adults INTEGER DEFAULT 1,
    number_of_children INTEGER DEFAULT 0,
    total_price_usd DECIMAL(10, 2),
    special_requests TEXT,
    status_id INTEGER,
    payment_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(start_date);

-- Booking Statuses
CREATE TABLE IF NOT EXISTS booking_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE
);

-- Seed Booking Statuses
INSERT INTO booking_statuses (code, name, description, display_order, is_default) VALUES
('new', 'New', 'Booking request received', 1, TRUE),
('pending', 'Pending', 'Under review by admin', 2, FALSE),
('confirmed', 'Confirmed', 'Booking approved and confirmed', 3, FALSE),
('cancelled', 'Cancelled', 'Booking cancelled', 4, FALSE),
('completed', 'Completed', 'Tour completed', 5, FALSE)
ON CONFLICT (code) DO NOTHING;

-- Seed Permissions
INSERT INTO permissions (name, description) VALUES
('users.view', 'View users'),
('users.create', 'Create users'),
('users.edit', 'Edit users'),
('users.delete', 'Delete users'),
('roles.view', 'View roles'),
('roles.create', 'Create roles'),
('roles.edit', 'Edit roles'),
('roles.delete', 'Delete roles'),
('permissions.view', 'View permissions'),
('permissions.assign', 'Assign permissions to roles'),
('tours.view', 'View tours'),
('tours.create', 'Create tours'),
('tours.edit', 'Edit tours'),
('tours.delete', 'Delete tours'),
('tours.publish', 'Publish tours'),
('tours.archive', 'Archive tours'),
('categories.view', 'View tour categories'),
('categories.create', 'Create tour categories'),
('categories.edit', 'Edit tour categories'),
('categories.delete', 'Delete tour categories'),
('destinations.view', 'View destinations'),
('destinations.create', 'Create destinations'),
('destinations.edit', 'Edit destinations'),
('destinations.delete', 'Delete destinations'),
('media.view', 'View media library'),
('media.upload', 'Upload media'),
('media.edit', 'Edit media'),
('media.delete', 'Delete media'),
('media.folders', 'Manage media folders'),
('bookings.view', 'View bookings'),
('bookings.edit', 'Edit bookings'),
('bookings.confirm', 'Confirm bookings'),
('bookings.cancel', 'Cancel bookings'),
('bookings.delete', 'Delete bookings'),
('pages.view', 'View pages'),
('pages.create', 'Create pages'),
('pages.edit', 'Edit pages'),
('pages.delete', 'Delete pages'),
('pages.publish', 'Publish pages'),
('menus.view', 'View menus'),
('menus.create', 'Create menus'),
('menus.edit', 'Edit menus'),
('menus.delete', 'Delete menus'),
('settings.view', 'View site settings'),
('settings.edit', 'Edit site settings'),
('email_templates.view', 'View email templates'),
('email_templates.edit', 'Edit email templates'),
('newsletter.view', 'View newsletter subscribers'),
('newsletter.send', 'Send newsletters'),
('newsletter.export', 'Export subscribers'),
('reviews.view', 'View reviews'),
('reviews.moderate', 'Moderate reviews'),
('reports.view', 'View reports'),
('reports.export', 'Export reports'),
('audit_logs.view', 'View audit logs'),
('dashboard.view', 'View dashboard')
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to Super Admin
DO $$
DECLARE
    role_id INTEGER;
    perm_id INTEGER;
BEGIN
    SELECT id INTO role_id FROM roles WHERE name = 'Super Admin' LIMIT 1;
    
    IF role_id IS NOT NULL THEN
        FOR perm_id IN SELECT id FROM permissions LOOP
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- Seed default site settings
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('site_name', '"Tanzania Safari Magic"', 'Website name'),
('site_description', '"Experience authentic Tanzania safari tours with expert local guides"', 'Website description'),
('company_name', '"Tanzania Safari Magic"', 'Company name'),
('company_email', '"info@tanzaniasafarimagic.com"', 'Company email'),
('company_phone', '"+255 789 456 123"', 'Company phone'),
('company_address', '"Arusha, Tanzania"', 'Company address'),
('social_facebook', '"https://facebook.com/tanzaniasafarimagic"', 'Facebook URL'),
('social_twitter', '"https://twitter.com/tanzaniasafarimagic"', 'Twitter URL'),
('social_instagram', '"https://instagram.com/tanzaniasafarimagic"', 'Instagram URL'),
('social_linkedin', '"https://linkedin.com/company/tanzaniasafarimagic"', 'LinkedIn URL'),
('business_hours', '"Mon-Fri: 8AM-6PM, Sat: 9AM-4PM"', 'Business hours'),
('timezone', '"Africa/Dar_es_Salaam"', 'Website timezone'),
('default_language', '"en"', 'Default language'),
('seo_default_title', '"Tanzania Safari Magic | African Adventures"', 'Default SEO title'),
('seo_default_description', '"Experience authentic Tanzania safari tours. Witness the Great Migration, climb Kilimanjaro, and explore pristine national parks."', 'Default SEO description'),
('logo_url', '"/images/logo.png"', 'Logo image URL'),
('favicon_url', '"/favicon.ico"', 'Favicon URL')
ON CONFLICT (setting_key) DO NOTHING;

-- Create default menu
INSERT INTO menus (code, name, description, location) VALUES
('main', 'Main Menu', 'Primary navigation menu', 'header'),
('footer', 'Footer Menu', 'Footer navigation menu', 'footer')
ON CONFLICT (code) DO NOTHING;
