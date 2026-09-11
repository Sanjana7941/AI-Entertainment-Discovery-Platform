const express = require('express');
const router = express.Router();
const { search, getSuggestions, getSearchHistory, clearSearchHistory } = require('../controllers/searchController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, search);
router.get('/suggestions', getSuggestions);
router.get('/history', protect, getSearchHistory);
router.delete('/history', protect, clearSearchHistory);

module.exports = router;
