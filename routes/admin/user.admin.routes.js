const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/UserController');
const { requireAuth } = require('../../middleware/authMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');

router.use(requireAuth);

router.get('/', requirePermission('users.read'), userController.list);
router.post('/', requirePermission('users.create'), userController.create);
router.get('/:id', requirePermission('users.read'), userController.getById);
router.put('/:id', requirePermission('users.edit'), userController.update);
router.delete('/:id', requirePermission('users.delete'), userController.delete);

module.exports = router;
