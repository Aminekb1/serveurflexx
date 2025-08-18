const mongoose = require('mongoose');

const panierSchema = new mongoose.Schema({
  id: { type: String, require: true, unique: true },
  prixTotal: { type: Number, require: true },
  ressourcesDisponibles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ressource' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
//  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //one to one
// ressources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ressource" }], //one to many
});

module.exports = mongoose.model('Panier', panierSchema);