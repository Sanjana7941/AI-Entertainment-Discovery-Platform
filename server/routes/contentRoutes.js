const express = require('express');
const router = express.Router();
const {
  getContentList,
  getContentById,
  getMetadata,
  createContent,
  updateContent,
  deleteContent
} = require('../controllers/contentController');
const { protect, optionalAuth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/meta/filters', getMetadata);
router.get('/', optionalAuth, getContentList);
router.get('/:id', optionalAuth, getContentById);

// Admin restricted
router.post('/', protect, admin, createContent);
router.put('/:id', protect, admin, updateContent);
router.delete('/:id', protect, admin, deleteContent);

module.exports = router;
