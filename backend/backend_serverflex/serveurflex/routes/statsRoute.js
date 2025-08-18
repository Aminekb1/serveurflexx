// backend_serverflex/serveurflex/routes/statsRoute.js
const express = require("express");
const router = express.Router();
const statsController = require("../Controllers/statsController");

router.get("/commandes", statsController.getCommandeStats);
router.get("/factures", statsController.getFactureStats);
router.get("/notifications", statsController.getNotificationStats);
router.get("/ressources", statsController.getRessourceStats);
module.exports = router;
