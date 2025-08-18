var express = require('express');
var router = express.Router();
const ressourceController = require("../Controllers/ressourceController");
/* GET home page. */

router.get('/getAllRessources', ressourceController.getAllRessources );
router.get('/getRessourceById/:id', ressourceController.getRessourceById );
router.post('/addRessource', ressourceController.addRessource );
router.put('/updateRessource/:id', ressourceController.updateRessource );
//router.put('/affect', ressourceController.affect );
//router.put('/desaffect', ressourceController.desaffect );
router.delete('/deleteRessourceById/:id', ressourceController.deleteRessourceById );
router.delete('/removeResourceFromClient/:id', ressourceController.removeResourceFromClient );

router.get('/getAvailableNetworks', ressourceController.getAvailableNetworks);
router.get('/getAvailableResources', ressourceController.getAvailableResources);
router.get('/getAvailableISOs', ressourceController.getAvailableISOs);
router.post('/createCustomVM', ressourceController.createCustomVM);
module.exports = router;
