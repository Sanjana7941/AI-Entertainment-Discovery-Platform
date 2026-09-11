const express = require('express');
const router = express.Router();
const {
  getContentRatings,
  rateContent,
  getUserRatings,
  deleteRating
} = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.get('/user/me', protect, getUserRatings);
router.get('/:contentId', getContentRatings);
router.post('/', protect, rateContent);
router.delete('/:id', protect, deleteRating);

module.exports = router;
