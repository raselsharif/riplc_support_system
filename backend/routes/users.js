const express = require('express');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { validate, registerSchema, userUpdateSchema, adminPasswordSchema, branchAssignmentSchema } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('admin', 'it'), validate(registerSchema), UserController.create);
router.get('/', roleMiddleware('admin', 'it'), UserController.getAll);
router.get('/:id/branches', roleMiddleware('admin', 'mis', 'underwriting', 'it'), UserController.getBranches);
router.put('/:id/branches', roleMiddleware('admin', 'mis', 'underwriting', 'it'), validate(branchAssignmentSchema), UserController.updateBranches);
router.get('/:id', UserController.getById);
router.patch('/:id/status', roleMiddleware('admin', 'it'), UserController.updateStatus);
router.put('/:id', roleMiddleware('admin', 'it'), validate(userUpdateSchema), UserController.update);
router.delete('/:id', roleMiddleware('admin', 'it'), UserController.delete);
router.post('/:id/password', roleMiddleware('admin', 'it'), validate(adminPasswordSchema), UserController.adminChangePassword);
router.put('/:id', validate(userUpdateSchema), UserController.update); // admin or self guarded in service
router.delete('/:id', roleMiddleware('admin'), UserController.delete);
router.post('/:id/password', roleMiddleware('admin'), validate(adminPasswordSchema), UserController.adminChangePassword);
router.post('/:id/profile-image', upload.single('file'), UserController.uploadProfileImage);

module.exports = router;
