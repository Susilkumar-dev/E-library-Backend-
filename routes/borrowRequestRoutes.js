const express = require('express');
const {
  submitBorrowRequest,
  getBorrowRequests,
  updateBorrowRequest,
  deleteBorrowRequest,
  getUserBorrowRequests,
  getBorrowStats,
  getMyBorrowRequests
} = require('../controllers/borrowController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, submitBorrowRequest);
router.get('/', protect, getBorrowRequests);
router.get('/my-requests', protect, getMyBorrowRequests);
router.get('/stats', protect, admin, getBorrowStats);
router.get('/user/:userId', protect, getUserBorrowRequests);
router.put('/:id', protect, updateBorrowRequest);
router.delete('/:id', protect, deleteBorrowRequest);

module.exports = router;