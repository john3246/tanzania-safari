const db = require('../config/db');

class SafariModel {
  // Get all active safari packages with filters
  static async getAllPackages(filters = {}) {
    let query = `
      SELECT 
        sp.package_id,
        sp.package_name,
        sp.package_slug,
        sp.short_description,
        sp.detailed_description,
        sp.duration_days,
        sp.duration_nights,
        sp.difficulty_level,
        sp.best_months,
        sp.highlights,
        sp.included_features,
        sp.excluded_features,
        sp.base_price_usd,
        sp.is_featured,
        sp.is_active,
        pc.category_name,
        pc.category_slug,
        ARRAY_AGG(DISTINCT np.park_name) as destinations,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count,
        (SELECT image_urls[1] FROM package_itinerary pi2 
         WHERE pi2.package_id = sp.package_id 
         AND pi2.image_urls IS NOT NULL 
         AND array_length(pi2.image_urls, 1) > 0 
         LIMIT 1) as image_url
      FROM safari_packages sp
      LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
      LEFT JOIN package_destinations pd ON sp.package_id = pd.package_id
      LEFT JOIN national_parks np ON pd.park_id = np.park_id
      LEFT JOIN reviews r ON sp.package_id = r.package_id AND r.is_approved = true
      WHERE sp.is_active = true
    `;

    const conditions = [];
    const values = [];
    let paramCounter = 1;

    // Category filter
    if (filters.category && filters.category !== 'all') {
      conditions.push(`pc.category_slug = $${paramCounter}`);
      values.push(filters.category);
      paramCounter++;
    }

    // Destination filter
    if (filters.destination && filters.destination !== 'all') {
      conditions.push(`np.park_slug = $${paramCounter}`);
      values.push(filters.destination);
      paramCounter++;
    }

    // Duration filter
    if (filters.duration && filters.duration !== 'all') {
      switch (filters.duration) {
        case '1-3':
          conditions.push(`sp.duration_days BETWEEN 1 AND 3`);
          break;
        case '4-6':
          conditions.push(`sp.duration_days BETWEEN 4 AND 6`);
          break;
        case '7-9':
          conditions.push(`sp.duration_days BETWEEN 7 AND 9`);
          break;
        case '10+':
          conditions.push(`sp.duration_days >= 10`);
          break;
      }
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      conditions.push(`LOWER(sp.difficulty_level) = $${paramCounter}`);
      values.push(filters.difficulty);
      paramCounter++;
    }

    // Price range filter
    if (filters.min_price) {
      conditions.push(`sp.base_price_usd >= $${paramCounter}`);
      values.push(parseFloat(filters.min_price));
      paramCounter++;
    }
    if (filters.max_price) {
      conditions.push(`sp.base_price_usd <= $${paramCounter}`);
      values.push(parseFloat(filters.max_price));
      paramCounter++;
    }

    // Search filter
    if (filters.search) {
      conditions.push(`(
        sp.package_name ILIKE $${paramCounter} OR 
        sp.short_description ILIKE $${paramCounter} OR
        np.park_name ILIKE $${paramCounter}
      )`);
      values.push(`%${filters.search}%`);
      paramCounter++;
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY sp.package_id, pc.category_name, pc.category_slug
    `;

    // Sorting
    switch (filters.sort) {
      case 'price-asc':
        query += ' ORDER BY sp.base_price_usd ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY sp.base_price_usd DESC';
        break;
      case 'duration-asc':
        query += ' ORDER BY sp.duration_days ASC';
        break;
      case 'duration-desc':
        query += ' ORDER BY sp.duration_days DESC';
        break;
      case 'rating':
        query += ' ORDER BY avg_rating DESC NULLS LAST';
        break;
      case 'newest':
        query += ' ORDER BY sp.created_at DESC';
        break;
      default:
        query += ' ORDER BY sp.is_featured DESC, sp.created_at DESC';
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 9;
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  // Get total count for pagination
  static async getPackagesCount(filters = {}) {
    let query = `
      SELECT COUNT(DISTINCT sp.package_id) as total
      FROM safari_packages sp
      LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
      LEFT JOIN package_destinations pd ON sp.package_id = pd.package_id
      LEFT JOIN national_parks np ON pd.park_id = np.park_id
      WHERE sp.is_active = true
    `;

    const conditions = [];
    const values = [];
    let paramCounter = 1;

    if (filters.category && filters.category !== 'all') {
      conditions.push(`pc.category_slug = $${paramCounter}`);
      values.push(filters.category);
      paramCounter++;
    }
    if (filters.destination && filters.destination !== 'all') {
      conditions.push(`np.park_slug = $${paramCounter}`);
      values.push(filters.destination);
      paramCounter++;
    }
    if (filters.duration && filters.duration !== 'all') {
      switch (filters.duration) {
        case '1-3':
          conditions.push(`sp.duration_days BETWEEN 1 AND 3`);
          break;
        case '4-6':
          conditions.push(`sp.duration_days BETWEEN 4 AND 6`);
          break;
        case '7-9':
          conditions.push(`sp.duration_days BETWEEN 7 AND 9`);
          break;
        case '10+':
          conditions.push(`sp.duration_days >= 10`);
          break;
      }
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      conditions.push(`LOWER(sp.difficulty_level) = $${paramCounter}`);
      values.push(filters.difficulty);
      paramCounter++;
    }
    if (filters.search) {
      conditions.push(`(
        sp.package_name ILIKE $${paramCounter} OR 
        sp.short_description ILIKE $${paramCounter} OR
        np.park_name ILIKE $${paramCounter}
      )`);
      values.push(`%${filters.search}%`);
      paramCounter++;
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].total);
  }

  // Get featured packages for homepage
  static async getFeaturedPackages(limit = 6) {
    const query = `
      SELECT 
        sp.package_id,
        sp.package_name,
        sp.package_slug,
        sp.short_description,
        sp.duration_days,
        sp.difficulty_level,
        sp.base_price_usd,
        pc.category_name,
        pc.category_slug,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count,
        (SELECT image_urls[1] FROM package_itinerary pi 
         WHERE pi.package_id = sp.package_id 
         AND pi.image_urls IS NOT NULL 
         AND array_length(pi.image_urls, 1) > 0 
         LIMIT 1) as image_url
      FROM safari_packages sp
      LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
      LEFT JOIN reviews r ON sp.package_id = r.package_id AND r.is_approved = true
      WHERE sp.is_active = true AND sp.is_featured = true
      GROUP BY sp.package_id, pc.category_name, pc.category_slug
      ORDER BY sp.created_at DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // Get all categories
  static async getAllCategories() {
    const query = `
      SELECT 
        pc.category_id,
        pc.category_name,
        pc.category_slug,
        pc.category_description,
        pc.icon_class,
        COUNT(sp.package_id) as safari_count
      FROM package_categories pc
      LEFT JOIN safari_packages sp ON pc.category_id = sp.category_id AND sp.is_active = true
      WHERE pc.is_active = true
      GROUP BY pc.category_id
      ORDER BY pc.display_order
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Get all destinations (national parks)
  static async getAllDestinations() {
    const query = `
      SELECT 
        np.park_id,
        np.park_name,
        np.park_slug,
        np.park_description,
        np.image_urls[1] as image_url,
        COUNT(DISTINCT pd.package_id) as safari_count
      FROM national_parks np
      LEFT JOIN package_destinations pd ON np.park_id = pd.park_id
      LEFT JOIN safari_packages sp ON pd.package_id = sp.package_id AND sp.is_active = true
      WHERE np.is_active = true
      GROUP BY np.park_id
      ORDER BY np.park_name
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Get testimonials
  static async getTestimonials(limit = 6) {
    const query = `
      SELECT 
        r.review_id,
        r.rating,
        r.review_comment as comment,
        r.created_at,
        u.first_name,
        u.last_name,
        u.profile_image_url as user_image,
        c.country_name as country,
        sp.package_name as safari_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN countries c ON u.country_id = c.country_id
      LEFT JOIN safari_packages sp ON r.package_id = sp.package_id
      WHERE r.is_approved = true AND r.is_featured = true
      ORDER BY r.created_at DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // Get single package by slug
  static async getPackageBySlug(slug) {
    const query = `
      SELECT 
        sp.*,
        pc.category_name,
        pc.category_slug,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM safari_packages sp
      LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
      LEFT JOIN reviews r ON sp.package_id = r.package_id AND r.is_approved = true
      WHERE sp.package_slug = $1 AND sp.is_active = true
      GROUP BY sp.package_id, pc.category_name, pc.category_slug
    `;
    const result = await db.query(query, [slug]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  // Get package itinerary
  static async getPackageItinerary(packageId) {
    const query = `
      SELECT *
      FROM package_itinerary
      WHERE package_id = $1
      ORDER BY day_number
    `;
    const result = await db.query(query, [packageId]);
    return result.rows;
  }

  // Get package destinations
  static async getPackageDestinations(packageId) {
    const query = `
      SELECT 
        pd.*,
        np.park_name,
        np.park_slug,
        ca.area_name
      FROM package_destinations pd
      LEFT JOIN national_parks np ON pd.park_id = np.park_id
      LEFT JOIN conservation_areas ca ON pd.area_id = ca.area_id
      WHERE pd.package_id = $1
      ORDER BY pd.visit_day
    `;
    const result = await db.query(query, [packageId]);
    return result.rows;
  }

  // Get stats for homepage
  static async getStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM safari_packages WHERE is_active = true) as total_packages,
        (SELECT COUNT(*) FROM national_parks WHERE is_active = true) as total_destinations,
        (SELECT COUNT(*) FROM guides WHERE is_available = true) as total_guides,
        (SELECT COUNT(*) FROM reviews WHERE is_approved = true) as total_reviews
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  // Subscribe to newsletter
  static async subscribeNewsletter(email) {
    const query = `
      INSERT INTO contact_enquiries (full_name, email, enquiry_type, enquiry_message)
      VALUES ($1, $2, $3, $4)
      RETURNING enquiry_id
    `;
    const result = await db.query(query, ['Newsletter Subscriber', email, 'Newsletter', 'Subscribed to newsletter']);
    return result.rows[0];
  }

  // Submit contact enquiry
  static async submitEnquiry(data) {
    const query = `
      INSERT INTO contact_enquiries (
        full_name, email, phone, country, enquiry_type, 
        package_id, preferred_travel_date, number_of_travelers, 
        enquiry_message, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING enquiry_id
    `;
    const values = [
      data.full_name,
      data.email,
      data.phone || null,
      data.country || null,
      data.enquiry_type || 'General',
      data.package_id || null,
      data.travel_date || null,
      data.travelers || null,
      data.message,
      data.ip_address || null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = SafariModel;