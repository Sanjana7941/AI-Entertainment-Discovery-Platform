const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations,
  getTrending,
  getByMood,
  getSimilar
} = require('../controllers/recommendController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getPersonalizedRecommendations);
router.get('/trending', optionalAuth, getTrending);
router.get('/mood/:mood', optionalAuth, getByMood);
router.get('/similar/:id', optionalAuth, getSimilar);

module.exports = router;
