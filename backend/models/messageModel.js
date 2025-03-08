const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Please add a conversation'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a sender'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a receiver'],
    },
    content: {
      type: String,
      required: [true, 'Please add a message content'],
      trim: true,
      maxlength: [1000, 'Message cannot be more than 1000 characters'],
    },
    attachments: [
      {
        type: String, // URL to S3 bucket
        contentType: String, // MIME type
        filename: String,
        size: Number, // in bytes
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
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
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

// Mark message as read
messageSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = Date.now();
  await this.save();
};

// Mark message as deleted for a user
messageSchema.methods.markAsDeleted = async function (userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId);
    
    // If both users have deleted the message, set isDeleted to true
    if (this.deletedBy.length === 2) {
      this.isDeleted = true;
    }
    
    await this.save();
  }
};

// Update conversation's lastMessage
messageSchema.post('save', async function () {
  // Only update if the message is not deleted
  if (!this.isDeleted) {
    await this.model('Conversation').findByIdAndUpdate(this.conversation, {
      lastMessage: this._id,
      updatedAt: Date.now(),
    });
  }
});

module.exports = mongoose.model('Message', messageSchema); 