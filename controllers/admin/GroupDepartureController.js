const groupDepartureRepo = require('../../repositories/GroupDepartureRepository');
const db = require('../../config/db');

class GroupDepartureController {
    async list(req, res) {
        try {
            const data = await groupDepartureRepo.listAdmin({
                package_id: req.query.package_id || null
            });
            res.json({ success: true, data });
        } catch (error) {
            console.error('admin list departures:', error);
            res.status(500).json({ success: false, message: 'Error fetching departures' });
        }
    }

    async listPackages(req, res) {
        try {
            const data = await groupDepartureRepo.listGroupPackages();
            res.json({ success: true, data });
        } catch (error) {
            console.error('admin list group packages:', error);
            res.status(500).json({ success: false, message: 'Error fetching group packages' });
        }
    }

    async create(req, res) {
        try {
            const { package_id, start_date } = req.body;
            if (!package_id || !start_date) {
                return res.status(400).json({ success: false, message: 'package_id and start_date are required' });
            }
            const data = await groupDepartureRepo.create(req.body);
            res.status(201).json({ success: true, data, message: 'Departure created' });
        } catch (error) {
            console.error('admin create departure:', error);
            const msg = error.code === '23505' ? 'Departure slug already exists' : (error.message || 'Error creating departure');
            res.status(400).json({ success: false, message: msg });
        }
    }

    async update(req, res) {
        try {
            const existing = await groupDepartureRepo.getById(req.params.id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Departure not found' });
            }
            const data = await groupDepartureRepo.update(req.params.id, req.body);
            res.json({ success: true, data, message: 'Departure updated' });
        } catch (error) {
            console.error('admin update departure:', error);
            res.status(400).json({ success: false, message: error.message || 'Error updating departure' });
        }
    }

    async remove(req, res) {
        try {
            const ok = await groupDepartureRepo.remove(req.params.id);
            if (!ok) return res.status(404).json({ success: false, message: 'Departure not found' });
            res.json({ success: true, message: 'Departure deleted' });
        } catch (error) {
            console.error('admin delete departure:', error);
            res.status(500).json({ success: false, message: 'Error deleting departure' });
        }
    }

    async markPackageGroup(req, res) {
        try {
            const { package_id, is_group_tour = true, physical_rating, min_age, group_max_pax,
                inclusions_html, exclusions_html, packing_list_html, visa_info_html,
                start_date, end_date, capacity, price_usd, discount_percent } = req.body;
            if (!package_id) {
                return res.status(400).json({ success: false, message: 'package_id is required' });
            }

            // Prefer Group Safaris category when marking
            let categoryId = null;
            try {
                const cat = await db.query(
                    `SELECT category_id FROM package_categories WHERE category_slug = 'group-safaris' LIMIT 1`
                );
                categoryId = cat.rows[0]?.category_id || null;
            } catch (_) { /* optional */ }

            const result = await db.query(`
                UPDATE safari_packages SET
                    is_group_tour = $1,
                    is_active = CASE WHEN $1 = true THEN true ELSE is_active END,
                    is_private = CASE WHEN $1 = true THEN false ELSE is_private END,
                    physical_rating = COALESCE($2, physical_rating),
                    min_age = COALESCE($3, min_age),
                    group_max_pax = COALESCE($4, group_max_pax),
                    maximum_pax = COALESCE($4, maximum_pax, group_max_pax),
                    inclusions_html = COALESCE($5, inclusions_html),
                    exclusions_html = COALESCE($6, exclusions_html),
                    packing_list_html = COALESCE($7, packing_list_html),
                    visa_info_html = COALESCE($8, visa_info_html),
                    category_id = COALESCE($9, category_id),
                    updated_at = NOW()
                WHERE package_id = $10
                RETURNING package_id, package_name, package_slug, is_group_tour, physical_rating,
                          min_age, group_max_pax, duration_days, base_price_usd, is_active
            `, [
                Boolean(is_group_tour),
                physical_rating || null,
                min_age != null ? min_age : null,
                group_max_pax != null ? group_max_pax : null,
                inclusions_html || null,
                exclusions_html || null,
                packing_list_html || null,
                visa_info_html || null,
                categoryId,
                package_id
            ]);
            if (!result.rowCount) {
                return res.status(404).json({ success: false, message: 'Package not found' });
            }

            const pkg = result.rows[0];
            let departure = null;
            // Optional first departure so it appears on the public calendar immediately
            if (Boolean(is_group_tour) && start_date) {
                departure = await groupDepartureRepo.create({
                    package_id,
                    start_date,
                    end_date: end_date || null,
                    capacity: capacity || group_max_pax || 6,
                    price_usd: price_usd != null ? price_usd : Number(pkg.base_price_usd) || null,
                    discount_percent: discount_percent || 0,
                    status: 'open',
                    is_active: true,
                    is_featured: true
                });
            }

            res.json({
                success: true,
                data: { ...pkg, departure },
                message: departure
                    ? 'Tour marked as group safari and first departure published'
                    : 'Tour marked as group safari'
            });
        } catch (error) {
            console.error('markPackageGroup:', error);
            const msg = error.code === '23505' ? 'Departure slug already exists' : 'Error updating package';
            res.status(500).json({ success: false, message: msg });
        }
    }

    async adjustSeats(req, res) {
        try {
            const delta = parseInt(req.body.delta, 10);
            if (!delta) {
                return res.status(400).json({ success: false, message: 'delta is required' });
            }
            const data = await groupDepartureRepo.adjustSeats(req.params.id, delta);
            if (!data) return res.status(404).json({ success: false, message: 'Departure not found' });
            res.json({ success: true, data, message: 'Seats updated' });
        } catch (error) {
            console.error('adjustSeats:', error);
            res.status(500).json({ success: false, message: 'Error updating seats' });
        }
    }
}

module.exports = new GroupDepartureController();
