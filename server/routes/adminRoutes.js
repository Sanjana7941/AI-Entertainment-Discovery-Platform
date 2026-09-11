const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  deleteUserByAdmin,
  getReviewsForModeration,
  deleteReviewByAdmin,
  getAnalytics
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.use(protect, admin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUserByAdmin);
router.get('/reviews', getReviewsForModeration);
router.delete('/reviews/:id', deleteReviewByAdmin);
router.get('/analytics', getAnalytics);

module.exports = router;
