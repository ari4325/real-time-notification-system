const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model('Notification', NotificationSchema);
