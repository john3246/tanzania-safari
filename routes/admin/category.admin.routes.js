const express = require('express');
const router = express.Router();
const categoryRepository = require('../../repositories/category.repository');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        const data = await categoryRepository.getAllAdmin();
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to load categories' });
    }
});

router.post('/', async (req, res) => {
    // Basic stub for saving
    res.json({ success: true });
});

router.put('/:id', async (req, res) => {
    // Basic stub for updating
    res.json({ success: true });
});

module.exports = router;