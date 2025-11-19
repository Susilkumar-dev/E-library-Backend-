const express = require('express');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/:id', getBookById);
router.post('/', protect, admin, createBook);
router.put('/:id', protect, admin, updateBook);
router.delete('/:id', protect, admin, deleteBook);

module.exports = router;