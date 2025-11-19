const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

const EnhancedBookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  coverImage: {
    type: String,
    default: 'https://via.placeholder.com/300x400?text=No+Cover'
  },
  cover_url: {
    type: String,
    default: 'https://via.placeholder.com/300x400?text=No+Cover'
  },
  publishedYear: {
    type: Number,
    required: [true, 'Please add publish year']
  },
  publish_year: {
    type: Number
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  available: {
    type: Boolean,
    default: true
  },
  pages: {
    type: Number,
    default: 0
  },
  publisher: {
    type: String,
    default: 'Unknown'
  },
  language: {
    type: String,
    default: 'English'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  // Enhanced fields
  edition: {
    type: String,
    default: 'First Edition'
  },
  isEbook: {
    type: Boolean,
    default: false
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  totalCopies: {
    type: Number,
    default: 1
  },
  availableCopies: {
    type: Number,
    default: 1
  },
  reviews: [ReviewSchema],
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  tags: [String]
}, { 
  timestamps: true 
});

EnhancedBookSchema.pre('save', function(next) {
  if (this.publishedYear && !this.publish_year) {
    this.publish_year = this.publishedYear;
  }
  if (this.publish_year && !this.publishedYear) {
    this.publishedYear = this.publish_year;
  }
  
  if (this.coverImage && !this.cover_url) {
    this.cover_url = this.coverImage;
  }
  if (this.cover_url && !this.coverImage) {
    this.coverImage = this.cover_url;
  }
  
  // Calculate average rating from reviews
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  }
  
  next();
});

// Update available copies based on borrow requests
EnhancedBookSchema.methods.updateAvailability = function() {
  this.available = this.availableCopies > 0;
  return this.save();
};

module.exports = mongoose.model('EnhancedBook', EnhancedBookSchema);