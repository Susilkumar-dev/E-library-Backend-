const Favorite = require('../models/Favorite');
const Book = require('../models/Book');

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('book')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch favorites'
    });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      book: bookId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Book already in favorites'
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      book: bookId
    });

    await favorite.populate('book');

    res.status(201).json({
      success: true,
      message: 'Book added to favorites',
      data: favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add favorite'
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      book: req.params.bookId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    await Favorite.findByIdAndDelete(favorite._id);

    res.json({
      success: true,
      message: 'Book removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove favorite'
    });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      book: req.params.bookId
    });

    res.json({
      success: true,
      data: {
        isFavorite: !!favorite
      }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check favorite'
    });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};