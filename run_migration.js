const db = require('./config/db');

// Each migration step runs independently so one failure (e.g. insufficient
// privileges for CREATE EXTENSION on managed Postgres) cannot skip the rest.
async function runStep(name, sql) {
    try {
        await db.query(sql);
        return true;
    } catch (err) {
        console.error(`Migration step "${name}" failed:`, err.message);
        return false;
    }
}

async function migrate() {
    // Postgres 13+ provides gen_random_uuid() natively; this is only a fallback
    // for older servers and is allowed to fail without blocking other steps.
    await runStep('pgcrypto extension', 'CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    await runStep('core tables and columns', `
        CREATE TABLE IF NOT EXISTS booking_communications (
            communication_id SERIAL PRIMARY KEY,
            booking_id UUID REFERENCES bookings(booking_id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            subject VARCHAR(255),
            content TEXT NOT NULL,
            direction VARCHAR(20),
            sender_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0.00;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0.00;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0.00;

        ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE media_library ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT;
        ALTER TABLE safari_packages ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
    `);

    await runStep('live chat tables', `
        CREATE TABLE IF NOT EXISTS chats (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            external_id VARCHAR(50) UNIQUE NOT NULL,
            status VARCHAR(50) DEFAULT 'open',
            visitor_name VARCHAR(100),
            visitor_email VARCHAR(255),
            page_url TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
            sender VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_chats_external_id ON chats(external_id);
        CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
    `);

    await runStep('customers table', `
        CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(200),
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            source VARCHAR(50) DEFAULT 'website',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower ON customers (LOWER(email));
    `);

    await runStep('notifications table', `
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            notification_type VARCHAR(50),
            notification_title VARCHAR(200) NOT NULL,
            notification_message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT false,
            related_entity_id VARCHAR(100),
            action_url TEXT,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (is_read, sent_at DESC);
    `);

    await runStep('group safari columns', `
        ALTER TABLE public.safari_packages
          ADD COLUMN IF NOT EXISTS is_group_tour boolean DEFAULT false,
          ADD COLUMN IF NOT EXISTS physical_rating varchar(40) DEFAULT 'Easy',
          ADD COLUMN IF NOT EXISTS min_age integer DEFAULT 3,
          ADD COLUMN IF NOT EXISTS group_max_pax integer DEFAULT 6,
          ADD COLUMN IF NOT EXISTS inclusions_html text,
          ADD COLUMN IF NOT EXISTS exclusions_html text,
          ADD COLUMN IF NOT EXISTS packing_list_html text,
          ADD COLUMN IF NOT EXISTS visa_info_html text;
        CREATE INDEX IF NOT EXISTS idx_safari_packages_is_group
          ON public.safari_packages (is_group_tour) WHERE is_group_tour = true;
    `);

    await runStep('group_departures table', `
        CREATE TABLE IF NOT EXISTS public.group_departures (
          departure_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          package_id uuid NOT NULL REFERENCES public.safari_packages(package_id) ON DELETE CASCADE,
          departure_slug varchar(160) NOT NULL,
          title_override varchar(200),
          start_date date NOT NULL,
          end_date date NOT NULL,
          capacity integer NOT NULL DEFAULT 6,
          seats_booked integer NOT NULL DEFAULT 0,
          price_usd numeric(12,2),
          discount_percent numeric(5,2) DEFAULT 0,
          status varchar(30) NOT NULL DEFAULT 'open',
          is_featured boolean DEFAULT false,
          is_active boolean DEFAULT true,
          admin_notes text,
          created_at timestamptz DEFAULT NOW(),
          updated_at timestamptz DEFAULT NOW(),
          CONSTRAINT group_departures_slug_key UNIQUE (departure_slug),
          CONSTRAINT group_departures_dates_chk CHECK (end_date >= start_date),
          CONSTRAINT group_departures_capacity_chk CHECK (capacity > 0),
          CONSTRAINT group_departures_seats_chk CHECK (seats_booked >= 0 AND seats_booked <= capacity)
        );
        CREATE INDEX IF NOT EXISTS idx_group_departures_dates
          ON public.group_departures (start_date) WHERE is_active = true;
        CREATE INDEX IF NOT EXISTS idx_group_departures_package
          ON public.group_departures (package_id);
        ALTER TABLE public.bookings
          ADD COLUMN IF NOT EXISTS departure_id uuid
            REFERENCES public.group_departures(departure_id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_bookings_departure
          ON public.bookings (departure_id) WHERE departure_id IS NOT NULL;
    `);

    await runStep('contact_enquiries group request columns', `
        ALTER TABLE public.contact_enquiries ADD COLUMN IF NOT EXISTS departure_id uuid;
        ALTER TABLE public.contact_enquiries ADD COLUMN IF NOT EXISTS seats_held integer DEFAULT 0;
        ALTER TABLE public.contact_enquiries ADD COLUMN IF NOT EXISTS deposit_percent numeric(5,2) DEFAULT 30;
        ALTER TABLE public.contact_enquiries ADD COLUMN IF NOT EXISTS deposit_amount_usd numeric(12,2);
        ALTER TABLE public.contact_enquiries ADD COLUMN IF NOT EXISTS deposit_due_at timestamptz;
        ALTER TABLE public.contact_enquiries ADD COLUMN IF NOT EXISTS seats_adjusted boolean DEFAULT false;
    `);

    await runStep('contact_enquiries status/type checks for group approvals', `
        ALTER TABLE public.contact_enquiries DROP CONSTRAINT IF EXISTS contact_enquiries_enquiry_status_check;
        ALTER TABLE public.contact_enquiries
          ADD CONSTRAINT contact_enquiries_enquiry_status_check
          CHECK (enquiry_status::text = ANY (ARRAY[
            'New'::text, 'In Progress'::text, 'Approved'::text,
            'Responded'::text, 'Converted'::text, 'Closed'::text
          ]));
        ALTER TABLE public.contact_enquiries DROP CONSTRAINT IF EXISTS contact_enquiries_enquiry_type_check;
        ALTER TABLE public.contact_enquiries
          ADD CONSTRAINT contact_enquiries_enquiry_type_check
          CHECK (enquiry_type::text = ANY (ARRAY[
            'General'::text, 'Booking'::text, 'Custom Safari'::text,
            'Group'::text, 'Corporate'::text, 'Other'::text,
            'Booking Inquiry'::text, 'Quick Booking'::text
          ]));
    `);

    await runStep('page_views analytics table', `
        CREATE TABLE IF NOT EXISTS public.page_views (
          view_id bigserial PRIMARY KEY,
          session_id varchar(64),
          path varchar(500) NOT NULL,
          title varchar(300),
          referrer text,
          referrer_host varchar(255),
          source varchar(120) DEFAULT 'Direct',
          utm_source varchar(120),
          utm_medium varchar(120),
          utm_campaign varchar(180),
          ip_hash varchar(64),
          user_agent varchar(500),
          country varchar(80),
          viewed_at timestamptz DEFAULT NOW()
        )
    `);
    await runStep('page_views indexes', `
        CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views (viewed_at DESC);
        CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views (path);
        CREATE INDEX IF NOT EXISTS idx_page_views_source ON public.page_views (source);
        CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views (session_id)
    `);

    await runStep('hub category seeds', `
        INSERT INTO public.package_categories (category_name, category_slug, category_description, icon_class, display_order, is_active)
        VALUES
          ('Classic Safaris', 'safaris', 'Private and classic northern-circuit safari tours', 'fa-binoculars', 1, true),
          ('Kilimanjaro', 'kilimanjaro', 'Kilimanjaro climbs and trek packages', 'fa-mountain', 2, true),
          ('Migration Safaris', 'migrations', 'Great Wildebeest Migration seasonal safaris', 'fa-paw', 3, true),
          ('Zanzibar', 'zanzibar', 'Zanzibar beach and island extensions', 'fa-umbrella-beach', 4, true),
          ('Group Safaris', 'group-safaris', 'Fixed-date shared group safaris', 'fa-users', 5, true)
        ON CONFLICT (category_slug) DO UPDATE SET
          category_name = EXCLUDED.category_name,
          category_description = EXCLUDED.category_description,
          icon_class = EXCLUDED.icon_class,
          is_active = true;
    `);

    console.log('Database migrations completed.');
}

module.exports = migrate;

if (require.main === module) {
    migrate().then(() => process.exit(0));
}
