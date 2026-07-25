-- ── Database Cleanup Script: Keep Only 1 Record for Bookings, Tours & Enquiries ──
-- Derived directly from database/tanzania.sql schema.
-- Execute this SQL script in your Render PostgreSQL console or psql query editor.

BEGIN;

-- 1. Clean Bookings (Keep 1 most recent booking record, delete all others)
DELETE FROM public.booking_travelers 
WHERE booking_id NOT IN (
    SELECT booking_id FROM public.bookings ORDER BY created_at DESC LIMIT 1
);

DELETE FROM public.booking_communications 
WHERE booking_id NOT IN (
    SELECT booking_id FROM public.bookings ORDER BY created_at DESC LIMIT 1
);

DELETE FROM public.guide_assignments 
WHERE booking_id NOT IN (
    SELECT booking_id FROM public.bookings ORDER BY created_at DESC LIMIT 1
);

DELETE FROM public.bookings 
WHERE booking_id NOT IN (
    SELECT booking_id FROM public.bookings ORDER BY created_at DESC LIMIT 1
);


-- 2. Clean Contact Enquiries (Keep 1 most recent inquiry record, delete all others)
DELETE FROM public.contact_enquiries 
WHERE enquiry_id NOT IN (
    SELECT enquiry_id FROM public.contact_enquiries ORDER BY created_at DESC LIMIT 1
);


-- 3. Clean Safari Package Tours (Keep 1 active package matching remaining booking)
DELETE FROM public.package_destinations 
WHERE package_id NOT IN (
    SELECT package_id FROM public.safari_packages 
    WHERE package_id IN (SELECT package_id FROM public.bookings) 
    LIMIT 1
);

DELETE FROM public.package_itinerary 
WHERE package_id NOT IN (
    SELECT package_id FROM public.safari_packages 
    WHERE package_id IN (SELECT package_id FROM public.bookings) 
    LIMIT 1
);

DELETE FROM public.package_accommodations 
WHERE package_id NOT IN (
    SELECT package_id FROM public.safari_packages 
    WHERE package_id IN (SELECT package_id FROM public.bookings) 
    LIMIT 1
);

DELETE FROM public.reviews 
WHERE package_id NOT IN (
    SELECT package_id FROM public.safari_packages 
    WHERE package_id IN (SELECT package_id FROM public.bookings) 
    LIMIT 1
);

DELETE FROM public.safari_packages 
WHERE package_id NOT IN (
    SELECT package_id FROM public.safari_packages 
    WHERE package_id IN (SELECT package_id FROM public.bookings) 
    LIMIT 1
);

COMMIT;
