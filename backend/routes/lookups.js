const express = require('express');
const LookupController = require('../controllers/LookupController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

const router = express.Router();

router.use(authMiddleware);

router.get('/departments', LookupController.getDepartments);
router.get('/branches', LookupController.getBranches);
router.post('/branches', roleMiddleware('admin'), LookupController.createBranch);
router.put('/branches/:id', roleMiddleware('admin'), LookupController.updateBranch);
router.delete('/branches/:id', roleMiddleware('admin'), LookupController.deleteBranch);

module.exports = router;
