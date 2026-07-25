-- ── Database Cleanup Script: Keep Only 1 Record for Bookings, Tours & Enquiries ──
-- Execute this SQL script in your Render PostgreSQL console or psql terminal.

BEGIN;

-- 1. Clean Bookings (Keep 1 most recent booking record, delete all others)
DELETE FROM booking_travelers 
WHERE booking_id NOT IN (
    SELECT booking_id FROM bookings ORDER BY created_at DESC LIMIT 1
);

DELETE FROM booking_communications 
WHERE booking_id NOT IN (
    SELECT booking_id FROM bookings ORDER BY created_at DESC LIMIT 1
);

DELETE FROM bookings 
WHERE booking_id NOT IN (
    SELECT booking_id FROM bookings ORDER BY created_at DESC LIMIT 1
);


-- 2. Clean Contact Enquiries (Keep 1 most recent inquiry record, delete all others)
DELETE FROM contact_enquiries 
WHERE enquiry_id NOT IN (
    SELECT enquiry_id FROM contact_enquiries ORDER BY created_at DESC LIMIT 1
);


-- 3. Clean Safari Package Tours (Keep 1 active package matching remaining booking)
DELETE FROM package_destinations 
WHERE package_id NOT IN (
    SELECT package_id FROM safari_packages WHERE package_id IN (SELECT package_id FROM bookings) LIMIT 1
);

DELETE FROM reviews 
WHERE package_id NOT IN (
    SELECT package_id FROM safari_packages WHERE package_id IN (SELECT package_id FROM bookings) LIMIT 1
);

DELETE FROM safari_packages 
WHERE package_id NOT IN (
    SELECT package_id FROM safari_packages WHERE package_id IN (SELECT package_id FROM bookings) LIMIT 1
);

COMMIT;
