const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await Review.find({ book: bookId })
      .sort({ createdAt: -1 })
      .populate('user', 'name')
      .limit(50);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

// @desc    Get user's review for a book
// @route   GET /api/reviews/book/:bookId/my-review
// @access  Private
const getUserReviewForBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const review = await Review.findOne({
      user: req.user._id,
      book: bookId
    });

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user review'
    });
  }
};

// @desc    Add a review
// @route   POST /api/reviews/book/:bookId
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { bookId } = req.params;

    // Validate input
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if book exists
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
      rating: parseInt(rating),
      comment: comment.trim()
    });

    // Update book's average rating
    await updateBookRating(bookId);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    console.error('Add review error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (rating) review.rating = parseInt(rating);
    if (comment) review.comment = comment.trim();

    await review.save();

    // Update book's average rating
    await updateBookRating(review.book);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update book's average rating
    await updateBookRating(review.book);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

// Helper function to update book's average rating
const updateBookRating = async (bookId) => {
  try {
    const reviews = await Review.find({ book: bookId });
    
    if (reviews.length === 0) {
      await Book.findByIdAndUpdate(bookId, {
        averageRating: 0,
        reviewCount: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    await Book.findByIdAndUpdate(bookId, {
      averageRating,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Update book rating error:', error);
  }
};

module.exports = {
  getBookReviews,
  getUserReviewForBook,
  addReview,
  updateReview,
  deleteReview,
  updateBookRating
};