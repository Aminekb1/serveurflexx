const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Email','SMS'], required: true },
  message: { type: String, required: true },
  destinataire: String,
  dateEnvoi: { type: Date, default: Date.now },
  ressource: { type: mongoose.Schema.Types.ObjectId, ref: 'Ressource' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lu: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);