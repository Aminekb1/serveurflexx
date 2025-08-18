const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commande: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', required: true },
  montant: { type: Number, required: true },
  methodePaiement: { type: String, enum: ['carte', 'virement', 'paypal'], default: 'carte' }, // Ajouté
  statutPaiement: { type: String, enum: ['pending', 'payé', 'annulé'], default: 'pending' },
  effectuerPaiement: { type: Boolean, default: false },
  annulerPaiement: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Facture', factureSchema);