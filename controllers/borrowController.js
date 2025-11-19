const BorrowRequest = require('../models/BorrowRequest');
const Book = require('../models/Book');

const submitBorrowRequest = async (req, res) => {
  try {
    const {
      bookId,
      bookTitle,
      bookAuthor,
      bookCover,
      libraryCardId,
      memberName,
      memberEmail,
      memberPhone,
      borrowDuration
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (!book.available) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for borrowing'
      });
    }

    const existingRequest = await BorrowRequest.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ['pending', 'approved', 'borrowed'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active request for this book'
      });
    }

    const borrowRequest = await BorrowRequest.create({
      user: req.user._id,
      book: bookId,
      bookTitle,
      bookAuthor,
      bookCover,
      libraryCardId,
      memberName,
      memberEmail,
      memberPhone,
      borrowDuration,
      status: 'pending'
    });

    await borrowRequest.populate('book user');

    res.status(201).json({
      success: true,
      message: 'Borrow request submitted successfully',
      data: borrowRequest
    });

  } catch (error) {
    console.error('Submit borrow request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit borrow request'
    });
  }
};

const getBorrowRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};

    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { bookTitle: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
        { memberEmail: { $regex: search, $options: 'i' } },
        { libraryCardId: { $regex: search, $options: 'i' } }
      ];
    }

    const borrowRequests = await BorrowRequest.find(query)
      .populate('book user')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: borrowRequests,
      total: borrowRequests.length
    });

  } catch (error) {
    console.error('Get borrow requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch borrow requests'
    });
  }
};

const updateBorrowRequest = async (req, res) => {
  try {
    const { status, rejectionReason, dueDate, returnedAt, fine } = req.body;
    const requestId = req.params.id;

    const borrowRequest = await BorrowRequest.findById(requestId).populate('book');
    
    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found'
      });
    }

    let updateData = {};
    let bookUpdate = {};

    switch (status) {
      case 'approved':
        if (borrowRequest.status !== 'pending') {
          return res.status(400).json({
            success: false,
            message: 'Only pending requests can be approved'
          });
        }

        const due = dueDate ? new Date(dueDate) : new Date(Date.now() + borrowRequest.borrowDuration * 24 * 60 * 60 * 1000);

        updateData = {
          status: 'approved',
          approvedBy: req.user.name,
          approvedAt: new Date(),
          dueDate: due
        };

        bookUpdate.available = false;
        break;

      case 'rejected':
        if (borrowRequest.status !== 'pending') {
          return res.status(400).json({
            success: false,
            message: 'Only pending requests can be rejected'
          });
        }

        if (!rejectionReason) {
          return res.status(400).json({
            success: false,
            message: 'Rejection reason is required'
          });
        }

        updateData = {
          status: 'rejected',
          rejectedBy: req.user.name,
          rejectedAt: new Date(),
          rejectionReason
        };
        break;

      case 'borrowed':
        if (borrowRequest.status !== 'approved') {
          return res.status(400).json({
            success: false,
            message: 'Only approved requests can be marked as borrowed'
          });
        }

        updateData = {
          status: 'borrowed',
          borrowedAt: new Date()
        };
        break;

      case 'returned':
        if (!['approved', 'borrowed', 'overdue'].includes(borrowRequest.status)) {
          return res.status(400).json({
            success: false,
            message: 'Only borrowed books can be returned'
          });
        }

        updateData = {
          status: 'returned',
          returnedAt: returnedAt || new Date(),
          returnedDate: returnedAt || new Date(),
          fine: fine || 0
        };

        bookUpdate.available = true;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
    }

    const updatedRequest = await BorrowRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true, runValidators: true }
    ).populate('book user');

    if (Object.keys(bookUpdate).length > 0) {
      await Book.findByIdAndUpdate(borrowRequest.book._id, bookUpdate);
    }

    res.json({
      success: true,
      message: `Borrow request ${status} successfully`,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Update borrow request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update borrow request'
    });
  }
};

const deleteBorrowRequest = async (req, res) => {
  try {
    const borrowRequest = await BorrowRequest.findById(req.params.id);

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found'
      });
    }

    if (req.user.role !== 'admin' && 
        (borrowRequest.user.toString() !== req.user._id.toString() || borrowRequest.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    await BorrowRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Borrow request deleted successfully'
    });

  } catch (error) {
    console.error('Delete borrow request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete borrow request'
    });
  }
};

const getUserBorrowRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these requests'
      });
    }

    const borrowRequests = await BorrowRequest.find({ user: userId })
      .populate('book')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: borrowRequests
    });

  } catch (error) {
    console.error('Get user borrow requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user borrow requests'
    });
  }
};

const getBorrowStats = async (req, res) => {
  try {
    const totalRequests = await BorrowRequest.countDocuments();
    const pendingRequests = await BorrowRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await BorrowRequest.countDocuments({ status: 'approved' });
    const borrowedRequests = await BorrowRequest.countDocuments({ status: 'borrowed' });
    const overdueRequests = await BorrowRequest.countDocuments({ 
      status: 'borrowed', 
      dueDate: { $lt: new Date() } 
    });

    res.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        borrowedRequests,
        overdueRequests
      }
    });

  } catch (error) {
    console.error('Get borrow stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch borrow statistics'
    });
  }
};

module.exports = {
  submitBorrowRequest,
  getBorrowRequests,
  updateBorrowRequest,
  deleteBorrowRequest,
  getUserBorrowRequests,
  getBorrowStats
};