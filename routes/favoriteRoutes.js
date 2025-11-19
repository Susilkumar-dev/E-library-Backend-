const express = require('express');
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/', protect, addFavorite);
router.delete('/:bookId', protect, removeFavorite);
router.get('/check/:bookId', protect, checkFavorite);

module.exports = router;