const mongoose = require('mongoose');

const ressourceSchema = new mongoose.Schema({
 id: { type: String, required: true, unique: true },
//id: { type: String, required: true },
  
  nom: { type: String, required: true },
  cpu: { type: Number, required: true },
  //type: { type: String, required: true },
  ram: { type: Number, required: true },
  stockage: { type: Number, required: true },
  nombreHeure: { type: Number, required: true, min: 1 },
 disponibilite: { type: Boolean, required: true },
  statut: { type: String, enum: ['Active', 'Inactive'], required: true },
  typeRessource: { type: String,enum: ['server', 'vm'], required: true }, 
  image: { type: String } ,
  os: { type: String,enum: ['windows','linux', 'ubuntu','macOs','CentOs'], required: true }, 
  network: { type: String },
  iso: { type: String },
  commandes: [{type: mongoose.Schema.Types.ObjectId, ref:"Commande" }]  ,
  connectionDetails: {
    ipAddress: { type: String },
    username: { type: String },
    password: { type: String },
    protocol: { type: String, enum: ['ssh', 'rdp'] }
  },
  allocatedStart: {type: Date,default: null},
});

module.exports = mongoose.model('Ressource', ressourceSchema);