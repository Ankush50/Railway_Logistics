const express = require('express');
const { 
  getServices, 
  searchServices, 
  createService, 
  updateService, 
  deleteService 
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { validateService } = require('../middleware/validation');

const router = express.Router();

router.get('/', getServices);
router.get('/search', searchServices);

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', validateService, createService);
router.put('/:id', validateService, updateService);
router.delete('/:id', deleteService);

module.exports = router;