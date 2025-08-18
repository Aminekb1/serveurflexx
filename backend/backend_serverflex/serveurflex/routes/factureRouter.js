var express = require("express");
var router = express.Router();
const factureController = require("../Controllers/factureController");

router.get("/getAllFactures", factureController.getAllFactures); 
router.post("/createFacture", factureController.createFacture); 
router.get("/getFactureById/:id", factureController.getFactureById);
router.put("/updateFacture/:id", factureController.updateFacture);
router.delete("/deleteFactureById/:id", factureController.deleteFactureById);
//router.post('/:id/prixtotal', auth, factureCtrl.calculateTotal);
router.post("/:id/calculateTotal", factureController.calculateTotal);
router.post("/:id/payer", factureController.payerFacture); 
router.post('/generate-pdf', factureController.generatePdf);
module.exports = router;