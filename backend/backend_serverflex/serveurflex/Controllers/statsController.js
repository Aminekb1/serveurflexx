// backend\backend_serverflex\serveurflex\Controllers\statsController.js
const commandeModel = require("../models/commandeModel");
const factureModel = require("../models/factureModel");
const notificationModel = require("../models/notificationModel");
const ressourceModel = require("../models/ressourceModel");

module.exports = {
  getCommandeStats: async (req, res) => {
    try {
      // Aggregate for orders stats
      const orderStats = await commandeModel.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
            sumMontant: { $sum: "$montant" },
          },
        },
        {
          $group: {
            _id: null,
            totalCommandes: { $sum: "$count" },
            totalMontant: { $sum: "$sumMontant" },
            commandesParMois: { $push: { mois: "$_id", count: "$count" } },
          },
        },
      ]);

      const stats = orderStats[0] || { totalCommandes: 0, totalMontant: 0, commandesParMois: [] };
      const avgMontant = stats.totalCommandes > 0 ? stats.totalMontant / stats.totalCommandes : 0;

      // Sort commandesParMois by month
      const sortedParMois = stats.commandesParMois.sort((a, b) => a.mois.localeCompare(b.mois));

      // Find peak month (highest orders)
      let peakMonth = '';
      let maxCount = 0;
      sortedParMois.forEach((item) => {
        if (item.count > maxCount) {
          maxCount = item.count;
          peakMonth = item.mois;
        }
      });

      // Find period with highest increase
      let maxGrowth = 0;
      let growthPeriod = sortedParMois.length > 1 ? '' : sortedParMois[0]?.mois || ''; // Default to first month if only one
      for (let i = 1; i < sortedParMois.length; i++) {
        const growth = sortedParMois[i].count - sortedParMois[i - 1].count;
        if (growth > maxGrowth) {
          maxGrowth = growth;
          growthPeriod = sortedParMois[i].mois;
        }
      }

      // Most consumed products (ressources)
      const mostConsumed = await commandeModel.aggregate([
        { $unwind: "$ressources" },
        { $group: { _id: "$ressources", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "ressources",
            localField: "_id",
            foreignField: "_id",
            as: "ressource",
          },
        },
        { $unwind: "$ressource" },
        { $project: { _id: 0, name: "$ressource.nom", count: 1 } },
      ]);

      res.status(200).json({
        totalCommandes: stats.totalCommandes,
        totalMontant: stats.totalMontant,
        montantMoyen: avgMontant,
        commandesParMois: Object.fromEntries(sortedParMois.map((item) => [item.mois, item.count])),
        peakMonth,
        growthPeriod,
        mostConsumed: mostConsumed.map(item => ({ name: item.name || 'Unknown', count: item.count })) || [],
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getFactureStats: async (req, res) => {
    try {
      const stats = await factureModel.aggregate([
        { $group: { _id: "$statutPaiement", count: { $sum: 1 }, total: { $sum: "$montant" } } },
        {
          $group: {
            _id: null,
            totalFactures: { $sum: "$count" },
            totalMontant: { $sum: "$total" },
            totalPaye: {
              $sum: { $cond: [{ $eq: ["$_id", "payé"] }, "$total", 0] },
            },
            parStatut: { $push: { statut: "$_id", count: "$count" } },
          },
        },
      ]);
      const result = stats[0] || { totalFactures: 0, totalMontant: 0, totalPaye: 0, parStatut: [] };
      const paidCount = result.parStatut.find((s) => s.statut === "payé")?.count || 0;
      const tauxPaiement = result.totalFactures > 0 ? (paidCount / result.totalFactures) * 100 : 0;
      res.status(200).json({
        totalFactures: result.totalFactures,
        totalMontant: result.totalMontant,
        totalPaye: result.totalPaye,
        tauxPaiement,
        parStatut: Object.fromEntries(result.parStatut.map((s) => [s.statut, s.count])),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getNotificationStats: async (req, res) => {
    try {
      const stats = await notificationModel.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 }, luCount: { $sum: { $cond: ["$lu", 1, 0] } } } },
        { $group: { _id: null, totalNotifications: { $sum: "$count" }, tauxLu: { $avg: "$luCount" }, parType: { $push: { type: "$_id", count: "$count" } } } }
      ]);
      res.status(200).json({
        totalNotifications: stats[0]?.totalNotifications || 0,
        tauxLu: stats[0]?.tauxLu || 0,
        parType: Object.fromEntries(stats[0]?.parType.map(t => [t.type, t.count]) || [])
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getRessourceStats: async (req, res) => {
    try {
      const stats = await ressourceModel.aggregate([
        { $group: { _id: "$typeRessource", count: { $sum: 1 }, disponible: { $sum: { $cond: ["$disponibilite", 1, 0] } } } },
        { $group: { _id: null, totalRessources: { $sum: "$count" }, tauxDisponibilite: { $avg: "$disponible" }, parType: { $push: { type: "$_id", count: "$count" } } } }
      ]);
      res.status(200).json({
        totalRessources: stats[0]?.totalRessources || 0,
        tauxDisponibilite: stats[0]?.tauxDisponibilite || 0,
        parType: Object.fromEntries(stats[0]?.parType.map(t => [t.type, t.count]) || [])
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};