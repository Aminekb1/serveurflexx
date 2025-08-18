const express = require("express");
const router = express.Router();
const commandeController = require("../Controllers/commandeController");
const { getMyCommandes } = require('../Controllers/commandeController');
const { requireAuthUser } = require('../middlewares/authMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
router.get("/getAllCommandes", commandeController.getAllCommandes);
router.post("/createCommande", commandeController.createCommande);
router.get("/getCommandeById/:id", commandeController.getCommandeById); 
router.delete("/deleteCommandeById/:id", commandeController.deleteCommandeById);
router.post("/addRessourceToCommande/addRessource", commandeController.addRessourceToCommande);
router.put('/updateCommande/:id', commandeController.updateCommande );
router.get("/searchCommandes", commandeController.searchCommandes); 
// Add this new line for the status update endpoint
router.put('/updateCommandeById/:id', commandeController.updateCommandeById);
router.get('/getAllCommandees', requireAuthUser, commandeController.getAllCommandes);

module.exports = router;