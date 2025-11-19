// controllers/reviewController.js
const Book = require('../models/Book');
const Review = require('../models/Review');

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      user: req.user._id,
      book: bookId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      book: bookId,
      rating,
      comment
    });

    // Update book's average rating
    await updateBookRating(bookId);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const reviews = await Review.find({ book: bookId })
      .sort({ createdAt: -1 })
      .populate('user', 'name');

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId });
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  await Book.findByIdAndUpdate(bookId, {
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: reviews.length
  });
};

module.exports = {
  addReview,
  getBookReviews,
  updateBookRating
};