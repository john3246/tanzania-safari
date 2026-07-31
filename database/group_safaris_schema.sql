-- ── Group safari support ──────────────────────────────────────
-- Run manually on Postgres if preferred, or via: node -e "require('./run_migration')()"
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Mark packages that are shared/group itinerary templates
-- Note: highlights already exists as text[] on safari_packages — do not re-add
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

-- Fixed departures / calendar seats
CREATE TABLE IF NOT EXISTS public.group_departures (
  departure_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  -- open | guaranteed | almost_full | full | cancelled
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

-- Link bookings to a departure (nullable = private/custom)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS departure_id uuid
    REFERENCES public.group_departures(departure_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_departure
  ON public.bookings (departure_id) WHERE departure_id IS NOT NULL;

-- Nav hub categories (idempotent seeds)
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
