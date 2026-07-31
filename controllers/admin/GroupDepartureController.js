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
                inclusions_html, exclusions_html, packing_list_html, visa_info_html } = req.body;
            if (!package_id) {
                return res.status(400).json({ success: false, message: 'package_id is required' });
            }
            const result = await db.query(`
                UPDATE safari_packages SET
                    is_group_tour = $1,
                    physical_rating = COALESCE($2, physical_rating),
                    min_age = COALESCE($3, min_age),
                    group_max_pax = COALESCE($4, group_max_pax),
                    inclusions_html = COALESCE($5, inclusions_html),
                    exclusions_html = COALESCE($6, exclusions_html),
                    packing_list_html = COALESCE($7, packing_list_html),
                    visa_info_html = COALESCE($8, visa_info_html),
                    is_private = CASE WHEN $1 = true THEN false ELSE is_private END,
                    updated_at = NOW()
                WHERE package_id = $9
                RETURNING package_id, package_name, package_slug, is_group_tour, physical_rating, min_age, group_max_pax
            `, [
                Boolean(is_group_tour),
                physical_rating || null,
                min_age != null ? min_age : null,
                group_max_pax != null ? group_max_pax : null,
                inclusions_html || null,
                exclusions_html || null,
                packing_list_html || null,
                visa_info_html || null,
                package_id
            ]);
            if (!result.rowCount) {
                return res.status(404).json({ success: false, message: 'Package not found' });
            }
            res.json({ success: true, data: result.rows[0], message: 'Package updated' });
        } catch (error) {
            console.error('markPackageGroup:', error);
            res.status(500).json({ success: false, message: 'Error updating package' });
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
