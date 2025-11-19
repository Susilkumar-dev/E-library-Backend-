const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-read/:id', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);
router.post('/', protect, createNotification); // For admin to create notifications

module.exports = router;