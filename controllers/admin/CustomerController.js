const CustomerRepository = require('../../repositories/CustomerRepository');

const CustomerController = {
    async list(req, res) {
        try {
            const search = req.query.search || '';
            const data = await CustomerRepository.findAll({ search, limit: 500 });
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = CustomerController;
