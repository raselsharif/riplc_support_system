const express = require('express');
const ContactController = require('../controllers/ContactController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

const router = express.Router();

router.use(authMiddleware);

router.get('/', ContactController.getAll);
router.get('/:id', ContactController.getById);
router.post('/', roleMiddleware('admin', 'it'), ContactController.create);
router.put('/:id', roleMiddleware('admin', 'it'), ContactController.update);
router.delete('/:id', roleMiddleware('admin', 'it'), ContactController.delete);

module.exports = router;
