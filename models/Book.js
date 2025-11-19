const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
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
  }
}, { 
  timestamps: true 
});

BookSchema.pre('save', function(next) {
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
  
  next();
});

module.exports = mongoose.model('Book', BookSchema);