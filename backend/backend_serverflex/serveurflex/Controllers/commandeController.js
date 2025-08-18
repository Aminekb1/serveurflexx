// backend\backend_serverflex\serveurflex\Controllers\commandeController.js
const commandeModel = require('../models/commandeModel');
const userModel = require('../models/userModel'); 
const ressourceModel = require('../models/ressourceModel');

exports.getAllCommandes = async (req, res) => {
  try {
    const query = req.user && req.user.role !== 'admin' ? { client: req.user._id } : {};
    const commandes = await commandeModel.find(query).populate("client").populate("ressources");
    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommandeById = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await commandeModel.findById(id).populate("client ressources");
    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCommande = async (req, res) => {
  try {
    const { id, client, dateCommande, ressources, montant } = req.body;  // Added montant
    const commande = new commandeModel({ 
      id,
      client, 
      dateCommande, 
      ressources: ressources || [],
      montant: montant || 0  // Handle montant
    });
    
    await commande.save();
    
    // Mise à jour de l'utilisateur
    await userModel.findByIdAndUpdate(client, { 
      $push: { commandes: commande._id } 
    });
    
    res.status(201).json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCommandeById = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await commandeModel.findByIdAndDelete(id);
    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }
    await userModel.updateMany({}, { $pull: { commandes: commande._id } });
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addRessourceToCommande = async (req, res) => {
  try {
    const { commandeId, ressourceId } = req.body;
    const commande = await commandeModel.findById(commandeId);
    if (!commande) return res.status(404).json({ message: 'Commande not found' });
    
    const ressource = await ressourceModel.findById(ressourceId);
    if (!ressource) return res.status(404).json({ message: 'Ressource not found' });
    
    commande.ressources.push(ressource._id);
    // Optionally update montant here if based on resources, e.g., commande.montant += ressource.price || 0;
    await commande.save();
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const { adresseLivraison, ressources, montant } = req.body;  // Added montant
    const commande = await commandeModel.findByIdAndUpdate(id, { $set: { adresseLivraison, ressources, montant } }, { new: true });
    if (!commande) {
      throw new Error("Commande not found");
    }
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchCommandes = async (req, res) => {
  try {
    const { clientId, search, sortBy = "dateCommande", order = "desc" } = req.query;
    const query = {};

    if (clientId) query.client = clientId;
    if (search) query.adresseLivraison = { $regex: search, $options: "i" };

    const commandes = await commandeModel.find(query)
      .populate("client ressources")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 });

    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCommandeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { client, dateCommande, adresseLivraison, ressources, status, montant } = req.body;  // Added montant

    const commande = await commandeModel.findById(id);
    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }

    if (status === 'accepté') {
      for (let resId of commande.ressources) {
        const res = await ressourceModel.findById(resId);
        if (!res || !res.disponible) {
          return res.status(400).json({ message: 'Une ou plusieurs ressources ne sont pas disponibles' });
        }
      }
      if (!commande.paymentValidated) {
        return res.status(400).json({ message: 'Paiement non finalisé' });
      }

      await userModel.findByIdAndUpdate(commande.client, {
        $push: { allocatedRessources: { $each: commande.ressources } }
      });

      // Update each resource: set not available and allocation start time
      for (let resId of commande.ressources) {
        await ressourceModel.findByIdAndUpdate(resId, {
          disponible: false,
          allocatedStart: new Date()
        });
      }
    }

    if (client) commande.client = client;
    if (dateCommande) {
      const newDate = new Date(dateCommande);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format for dateCommande' });
      }
      commande.dateCommande = newDate;
    }
    if (adresseLivraison) commande.adresseLivraison = adresseLivraison;
    if (ressources) commande.ressources = ressources;
    if (status) commande.status = status;
    if (montant !== undefined) commande.montant = montant;

    await commande.save();

    const updatedCommande = await commandeModel.findById(id).populate("client ressources");
    res.status(200).json(updatedCommande);
  } catch (error) {
    console.error('Error in updateCommandeById:', error); // Add this for debugging - check your server console
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid data type or ID' });
    }
    res.status(500).json({ message: error.message });
  }
};


exports.getAllCommandees = async (req, res) => {
  try {
    const query = req.user && req.user.role !== 'admin'
      ? { client: req.user._id, status: 'accepté' }
      : {};

    // CORRECTION: Assurez-vous de récupérer nombreHeure
    const commandes = await commandeModel
      .find(query)
      .populate("client")
      .populate({
        path: "ressources",
        select: "nom cpu ram stockage nombreHeure allocatedStart" 
      });

    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};