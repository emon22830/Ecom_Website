const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add participants'],
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure participants are unique
conversationSchema.pre('save', function (next) {
  this.participants = [...new Set(this.participants)];
  next();
});

// Virtual for conversation's messages
conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation',
  justOne: false,
  options: { sort: { createdAt: 1 } },
});

// Static method to find or create a conversation between two users
conversationSchema.statics.findOrCreateConversation = async function (
  userId1,
  userId2,
  productId = null,
  orderId = null
) {
  // Check if conversation already exists
  let conversation = await this.findOne({
    participants: { $all: [userId1, userId2] },
    product: productId,
  });

  // If conversation doesn't exist, create a new one
  if (!conversation) {
    conversation = await this.create({
      participants: [userId1, userId2],
      product: productId,
      order: orderId,
      unreadCount: {
        [userId1.toString()]: 0,
        [userId2.toString()]: 0,
      },
    });
  }

  return conversation;
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnreadCount = async function (userId) {
  const userIdStr = userId.toString();
  const currentCount = this.unreadCount.get(userIdStr) || 0;
  this.unreadCount.set(userIdStr, currentCount + 1);
  await this.save();
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnreadCount = async function (userId) {
  const userIdStr = userId.toString();
  this.unreadCount.set(userIdStr, 0);
  await this.save();
};

// Method to mark conversation as deleted for a user
conversationSchema.methods.markAsDeleted = async function (userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId);
    
    // If both users have deleted the conversation, set isDeleted to true
    if (this.deletedBy.length === this.participants.length) {
      this.isDeleted = true;
    }
    
    await this.save();
  }
};

// Method to block a conversation
conversationSchema.methods.block = async function (userId) {
  this.isBlocked = true;
  this.blockedBy = userId;
  await this.save();
};

// Method to unblock a conversation
conversationSchema.methods.unblock = async function () {
  this.isBlocked = false;
  this.blockedBy = undefined;
  await this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema); 