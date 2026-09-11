const express = require('express');
const router = express.Router();
const {
  getHistory,
  trackProgress,
  removeHistoryItem,
  clearHistory
} = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getHistory);
router.post('/', trackProgress);
router.delete('/:id', removeHistoryItem);
router.delete('/', clearHistory);

module.exports = router;
