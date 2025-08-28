var express = require('express');
var router = express.Router();
const ressourceController = require("../Controllers/ressourceController");
const { requireAuthUser } = require("../middlewares/authMiddleware"); 
/* GET home page. */

router.get('/getAllRessources', ressourceController.getAllRessources );
router.get('/getRessourceById/:id', ressourceController.getRessourceById );
router.post('/addRessource', ressourceController.addRessource );
router.put('/updateRessource/:id', ressourceController.updateRessource );
//router.put('/affect', ressourceController.affect );
//router.put('/desaffect', ressourceController.desaffect );
router.delete('/deleteRessourceById/:id', ressourceController.deleteRessourceById );
router.delete('/removeResourceFromClient/:id', ressourceController.removeResourceFromClient );
router.get('/:id/connection', requireAuthUser, ressourceController.getVMConnectionDetails); 
router.post('/:id/console', requireAuthUser, ressourceController.getVMConsole); 
router.get('/getAvailableNetworks', ressourceController.getAvailableNetworks);
router.get('/getAvailableResources', ressourceController.getAvailableResources);
router.get('/getAvailableISOs', ressourceController.getAvailableISOs);
router.post('/createCustomVM', ressourceController.createCustomVM);
router.get('/:id/status', requireAuthUser, ressourceController.checkVMStatus);
module.exports = router;
