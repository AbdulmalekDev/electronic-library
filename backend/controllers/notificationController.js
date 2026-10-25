import Borrow from '../models/Borrow.js';

// @desc    Get derived borrow notifications for admin
// @route   GET /api/notifications/borrows
// @access  Private (Admin/Librarian)
export const getBorrowNotifications = async (req, res, next) => {
    try {
        // Fetch recent borrows that are borrowed, returned, overdue, or pending
        const borrows = await Borrow.find({
            status: { $in: ['borrowed', 'returned', 'pending'] }
        })
        .populate('user', 'fullName username email')
        .populate('book', 'title')
        .sort({ updatedAt: -1 })
        .limit(50);

        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));

        const notifications = borrows.map(borrow => {
            let type = '';
            
            // Determine type logic
            if (borrow.status === 'pending') {
                type = 'pending';
            } else if (borrow.status === 'returned') {
                type = 'returned';
            } else if (new Date(borrow.dueDate) < now) {
                type = 'overdue';
            } else if (new Date(borrow.dueDate) <= twoDaysFromNow) {
                // If borrowed but due within 48 hours
                type = 'near_expiry';
            } else {
                type = 'borrowed';
            }
            
            return {
                id: borrow._id,
                type, 
                userId: borrow.user?._id,
                bookId: borrow.book?._id,
                userName: borrow.user?.fullName || borrow.user?.username || 'Unknown',
                bookTitle: borrow.book?.title || 'Unknown',
                createdAt: borrow.updatedAt,
                read: borrow.readByAdmin.includes(req.user.id)
            };
        });

        res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount: notifications.filter(n => !n.read).length
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Mark a specific borrow notification as read
// @route   PUT /api/notifications/mark-read/:id
// @access  Private (Admin/Librarian)
export const markAsRead = async (req, res, next) => {
    try {
        const borrow = await Borrow.findById(req.params.id);
        if (!borrow) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (!borrow.readByAdmin.includes(req.user.id)) {
            borrow.readByAdmin.push(req.user.id);
            await borrow.save();
        }

        res.status(200).json({ success: true, message: 'تم التحديد كمقروء' });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all borrow notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private (Admin/Librarian)
export const markAllAsRead = async (req, res, next) => {
    try {
        // Find borrows that aren't read by this admin and have relevant statuses
        const borrows = await Borrow.find({
            status: { $in: ['borrowed', 'returned', 'pending'] },
            readByAdmin: { $ne: req.user.id }
        }).limit(50);

        const updates = borrows.map(borrow => {
            if (!borrow.readByAdmin.includes(req.user.id)) {
                borrow.readByAdmin.push(req.user.id);
                return borrow.save();
            }
            return null;
        }).filter(p => p !== null);

        await Promise.all(updates);

        res.status(200).json({ success: true, message: 'تم تحديد الكل كمقروء' });
    } catch (error) {
        next(error);
    }
};
