const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a recipient'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'new_order',
        'order_status_update',
        'new_message',
        'seller_approval',
        'seller_rejection',
        'product_approval',
        'product_rejection',
        'payment_success',
        'payment_failure',
        'review',
        'system',
      ],
      required: [true, 'Please add a notification type'],
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      trim: true,
      maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    image: String, // URL to S3 bucket
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    data: {
      // Additional data for deep linking
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
      },
      reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
      url: String, // Deep link URL
    },
    deliveryStatus: {
      email: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'not_applicable'],
        default: 'not_applicable',
      },
      push: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'not_applicable'],
        default: 'not_applicable',
      },
      sms: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'not_applicable'],
        default: 'not_applicable',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Mark notification as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = Date.now();
  await this.save();
};

// Mark notification as deleted
notificationSchema.methods.markAsDeleted = async function () {
  this.isDeleted = true;
  await this.save();
};

// Update delivery status
notificationSchema.methods.updateDeliveryStatus = async function (
  channel,
  status
) {
  if (this.deliveryStatus[channel]) {
    this.deliveryStatus[channel] = status;
    await this.save();
  }
};

// Static method to create a notification
notificationSchema.statics.createNotification = async function (
  recipientId,
  senderId,
  type,
  title,
  message,
  data = {},
  image = null,
  deliveryChannels = ['push']
) {
  const deliveryStatus = {
    email: 'not_applicable',
    push: 'not_applicable',
    sms: 'not_applicable',
  };
  
  // Set delivery status for specified channels
  deliveryChannels.forEach((channel) => {
    if (deliveryStatus[channel] !== undefined) {
      deliveryStatus[channel] = 'pending';
    }
  });
  
  const notification = await this.create({
    recipient: recipientId,
    sender: senderId,
    type,
    title,
    message,
    image,
    data,
    deliveryStatus,
  });
  
  return notification;
};

module.exports = mongoose.model('Notification', notificationSchema); 