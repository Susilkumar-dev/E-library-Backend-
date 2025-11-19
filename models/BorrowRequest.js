const mongoose = require('mongoose');

const BorrowRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  bookAuthor: {
    type: String,
    required: true
  },
  bookCover: {
    type: String,
    default: ''
  },
  libraryCardId: {
    type: String,
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  memberEmail: {
    type: String,
    required: true
  },
  memberPhone: {
    type: String,
    default: ''
  },
  borrowDuration: {
    type: Number,
    required: true,
    default: 14
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: String,
    default: ''
  },
  approvedAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  returnedDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  rejectedBy: {
    type: String,
    default: ''
  },
  rejectedAt: {
    type: Date
  },
  requestId: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

BorrowRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    this.requestId = `BRW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);