const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  toggleLike
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWatchlist);
router.post('/:contentId', addToWatchlist);
router.delete('/:contentId', removeFromWatchlist);
router.post('/like/:contentId', toggleLike);

module.exports = router;
