const mongoose = require('mongoose');

const BorrowRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  bookTitle: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  bookAuthor: {
    type: String,
    required: [true, 'Book author is required'],
    trim: true
  },
  bookCover: {
    type: String,
    default: ''
  },
  libraryCardId: {
    type: String,
    required: [true, 'Library card ID is required'],
    trim: true
  },
  memberName: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  memberEmail: {
    type: String,
    required: [true, 'Member email is required'],
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  memberPhone: {
    type: String,
    default: '',
    trim: true
  },
  borrowDuration: {
    type: Number,
    required: true,
    default: 14,
    min: [1, 'Borrow duration must be at least 1 day'],
    max: [30, 'Borrow duration cannot exceed 30 days']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue'],
      message: 'Status must be one of: pending, approved, rejected, borrowed, returned, overdue'
    },
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
  borrowedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: '',
    trim: true
  },
  rejectedBy: {
    type: String,
    default: ''
  },
  rejectedAt: {
    type: Date
  },
  fine: {
    type: Number,
    default: 0,
    min: [0, 'Fine cannot be negative']
  },
  requestId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate unique request ID before saving
BorrowRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    this.requestId = `BRW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Index for better query performance
BorrowRequestSchema.index({ user: 1, status: 1 });
BorrowRequestSchema.index({ book: 1, status: 1 });
BorrowRequestSchema.index({ dueDate: 1 });
BorrowRequestSchema.index({ requestId: 1 });

// Virtual for calculating if book is overdue
BorrowRequestSchema.virtual('isOverdue').get(function() {
  if (this.status === 'borrowed' && this.dueDate) {
    return this.dueDate < new Date();
  }
  return false;
});

// Virtual for days remaining
BorrowRequestSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'borrowed' && this.dueDate) {
    const today = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtual fields are serialized
BorrowRequestSchema.set('toJSON', { virtuals: true });
BorrowRequestSchema.set('toObject', { virtuals: true });

// Static method to get overdue requests
BorrowRequestSchema.statics.getOverdueRequests = function() {
  return this.find({
    status: 'borrowed',
    dueDate: { $lt: new Date() }
  }).populate('user book');
};

// Instance method to calculate fine
BorrowRequestSchema.methods.calculateFine = function() {
  if (this.status === 'returned' && this.dueDate && this.returnedDate) {
    const due = new Date(this.dueDate);
    const returned = new Date(this.returnedDate);
    const diffTime = returned - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return diffDays * 1; // $1 per day
    }
  }
  return 0;
};

module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);