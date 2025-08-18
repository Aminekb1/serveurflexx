const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ressources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ressource' }],
  dateCommande: { type: Date, required: true },
  status: { type: String, enum: ['accepté', 'refusé', 'en traitement', 'non traité'], default: 'non traité' },
  paymentValidated: { type: Boolean, default: false },
  montant: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Commande', commandeSchema);