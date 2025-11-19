const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getBookReviews,
  getUserReviewForBook,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/book/:bookId', getBookReviews);
router.get('/book/:bookId/my-review', protect, getUserReviewForBook);
router.post('/book/:bookId', protect, addReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;