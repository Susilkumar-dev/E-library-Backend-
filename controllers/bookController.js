const Book = require('../models/Book');

const sampleBooks = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A classic novel of the Jazz Age, exploring themes of idealism, resistance to change, social upheaval, and excess.',
    category: 'Fiction',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    publishedYear: 1925,
    publish_year: 1925,
    isbn: '9780743273565',
    publisher: 'Scribner',
    pages: 180,
    language: 'English',
    rating: 4.5,
    available: true
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
    category: 'Fiction',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    publishedYear: 1960,
    publish_year: 1960,
    isbn: '9780061120084',
    publisher: 'J.B. Lippincott & Co.',
    pages: 281,
    language: 'English',
    rating: 4.8,
    available: true
  },
  {
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian social science fiction novel that examines totalitarian regimes and thought control.',
    category: 'Science Fiction',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    publishedYear: 1949,
    publish_year: 1949,
    isbn: '9780451524935',
    publisher: 'Secker & Warburg',
    pages: 328,
    language: 'English',
    rating: 4.7,
    available: true
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A romantic novel of manners that depicts the emotional development of protagonist Elizabeth Bennet.',
    category: 'Romance',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    publishedYear: 1813,
    publish_year: 1813,
    isbn: '9780141439518',
    publisher: 'T. Egerton',
    pages: 432,
    language: 'English',
    rating: 4.6,
    available: true
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A fantasy novel that follows the quest of home-loving Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon.',
    category: 'Fantasy',
    coverImage: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop',
    publishedYear: 1937,
    publish_year: 1937,
    isbn: '9780547928227',
    publisher: 'George Allen & Unwin',
    pages: 310,
    language: 'English',
    rating: 4.8,
    available: true
  }
];

const initializeBooks = async () => {
  try {
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.insertMany(sampleBooks);
      console.log('📚 Sample books added to database');
    }
  } catch (error) {
    console.log('⚠️ Could not initialize books:', error.message);
  }
};

const getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all' && category !== '') {
      query.category = { $regex: category, $options: 'i' };
    }

    const books = await Book.find(query).sort({ title: 1 });

    res.json({
      success: true,
      data: books,
      total: books.length
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch books'
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch book'
    });
  }
};

const createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create book'
    });
  }
};

const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update book'
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete book'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories'
    });
  }
};

initializeBooks();

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
};