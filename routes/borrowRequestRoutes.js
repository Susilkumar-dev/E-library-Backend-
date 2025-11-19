const express = require('express');
const {
  submitBorrowRequest,
  getBorrowRequests,
  updateBorrowRequest,
  deleteBorrowRequest,
  getUserBorrowRequests,
  getBorrowStats
} = require('../controllers/borrowController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, submitBorrowRequest);
router.get('/', protect, getBorrowRequests);
router.get('/stats', protect, admin, getBorrowStats);
router.get('/user/:userId', protect, getUserBorrowRequests);
router.put('/:id', protect, admin, updateBorrowRequest);
router.delete('/:id', protect, deleteBorrowRequest);

module.exports = router;