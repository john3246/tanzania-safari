const db = require('../config/db');

async function migrate() {
    try {
        console.log("Starting DB migration for Corporate CMS...");

        // 1. Create tour_categories table
        console.log("Creating tour_categories table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS tour_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                icon VARCHAR(100),
                image_url TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INTEGER DEFAULT 0,
                seo_title VARCHAR(255),
                seo_description TEXT,
                seo_keywords TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);

        // 2. Create destinations table
        console.log("Creating destinations table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS destinations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                short_description TEXT,
                description TEXT,
                country VARCHAR(100),
                region VARCHAR(100),
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                featured_image_url TEXT,
                gallery_urls TEXT[],
                is_featured BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INTEGER DEFAULT 0,
                seo_title VARCHAR(255),
                seo_description TEXT,
                seo_keywords TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);

        // 3. Create tours table
        console.log("Creating tours table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS tours (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                overview TEXT,
                description TEXT,
                price_usd NUMERIC(10,2) NOT NULL,
                duration_days INTEGER NOT NULL,
                duration_nights INTEGER,
                category_id INTEGER REFERENCES tour_categories(id) ON DELETE SET NULL,
                destination_id INTEGER REFERENCES destinations(id) ON DELETE SET NULL,
                difficulty VARCHAR(50),
                group_size_min INTEGER DEFAULT 1,
                group_size_max INTEGER,
                age_minimum INTEGER,
                highlights TEXT[],
                included TEXT[],
                excluded TEXT[],
                travel_tips TEXT[],
                itinerary JSONB DEFAULT '[]'::jsonb,
                faqs JSONB DEFAULT '[]'::jsonb,
                featured_image_url TEXT,
                gallery_urls TEXT[],
                gallery_order INTEGER[],
                is_featured BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                status VARCHAR(20) DEFAULT 'draft',
                seo_title VARCHAR(255),
                seo_description TEXT,
                seo_keywords TEXT,
                meta_robots VARCHAR(100),
                canonical_url TEXT,
                og_title VARCHAR(255),
                og_description TEXT,
                og_image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);

        // 4. Create related_tours table
        console.log("Creating related_tours table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS related_tours (
                tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
                related_tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
                PRIMARY KEY (tour_id, related_tour_id)
            );
        `);

        // 5. Migrate Categories
        console.log("Migrating Categories...");
        const oldCategories = await db.query("SELECT * FROM package_categories");
        for (const cat of oldCategories.rows) {
            await db.query(`
                INSERT INTO tour_categories (id, name, slug, description, icon, is_active, display_order)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (slug) DO NOTHING
            `, [cat.category_id, cat.category_name, cat.category_slug, cat.category_description, cat.icon_class, cat.is_active, cat.display_order]);
        }

        // 6. Migrate Destinations
        console.log("Migrating Destinations...");
        const oldParks = await db.query("SELECT * FROM national_parks");
        for (const park of oldParks.rows) {
            await db.query(`
                INSERT INTO destinations (id, name, slug, short_description, description, region, latitude, longitude, featured_image_url, gallery_urls, is_featured, is_active, display_order, seo_title, seo_description)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (slug) DO NOTHING
            `, [
                park.park_id, 
                park.park_name, 
                park.park_slug, 
                park.park_description?.substring(0, 200), 
                park.park_description, 
                park.location, 
                park.latitude ? parseFloat(park.latitude) : null,
                park.longitude ? parseFloat(park.longitude) : null,
                park.featured_image_url,
                park.gallery_urls,
                park.is_featured,
                park.is_active,
                park.display_order,
                park.meta_title,
                park.meta_description
            ]);
        }

        // 7. Migrate Packages/Tours (with formatted itinerary jsonb)
        console.log("Migrating Tours...");
        const oldPackages = await db.query("SELECT * FROM safari_packages");
        for (const pkg of oldPackages.rows) {
            // Fetch and format itinerary
            const itinRows = await db.query("SELECT * FROM package_itinerary WHERE package_id = $1 ORDER BY day_number ASC", [pkg.package_id]);
            const itinerary = itinRows.rows.map(day => ({
                day: day.day_number,
                title: day.day_title,
                description: day.day_description
            }));

            // Try to map to category and destination
            const categoryId = pkg.category_id;
            
            // Destinations: find first destination mapped
            const destMapping = await db.query("SELECT park_id FROM package_destinations WHERE package_id = $1 LIMIT 1", [pkg.package_id]);
            const destinationId = destMapping.rows[0]?.park_id || null;

            await db.query(`
                INSERT INTO tours (
                    title, slug, overview, description, price_usd, duration_days, duration_nights,
                    category_id, destination_id, difficulty, group_size_min, group_size_max,
                    highlights, included, excluded, itinerary, featured_image_url, gallery_urls,
                    is_featured, is_active, status, seo_title, seo_description
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                ON CONFLICT (slug) DO NOTHING
            `, [
                pkg.package_name,
                pkg.package_slug,
                pkg.short_description,
                pkg.detailed_description,
                pkg.base_price_usd,
                pkg.duration_days,
                pkg.duration_nights,
                categoryId,
                destinationId,
                pkg.difficulty_level,
                pkg.minimum_pax || 1,
                pkg.maximum_pax || 12,
                pkg.highlights,
                pkg.included_features,
                pkg.excluded_features,
                JSON.stringify(itinerary),
                pkg.featured_image_url,
                pkg.image_urls,
                pkg.is_featured,
                pkg.is_active,
                pkg.is_active ? 'published' : 'draft',
                pkg.meta_title,
                pkg.meta_description
            ]);
        }

        // Fix sequence values for SERIAL columns in postgres
        await db.query(`SELECT setval('tour_categories_id_seq', COALESCE((SELECT MAX(id)+1 FROM tour_categories), 1), false)`);
        await db.query(`SELECT setval('destinations_id_seq', COALESCE((SELECT MAX(id)+1 FROM destinations), 1), false)`);
        await db.query(`SELECT setval('tours_id_seq', COALESCE((SELECT MAX(id)+1 FROM tours), 1), false)`);

        console.log("Migration complete and tables seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
