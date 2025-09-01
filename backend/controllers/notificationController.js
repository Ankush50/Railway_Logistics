const Notification = require('../models/Notification');

// Get user notifications
exports.getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// Get unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });
    
    res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
};

// Create notification (internal use)
exports.createNotification = async (userId, title, message, type = 'system', relatedBooking = null) => {
  try {
    // Validate inputs
    if (!userId || !title || !message) {
      console.error('Invalid notification data:', { userId, title, message });
      return null;
    }
    
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      relatedBooking
    });
    
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};
