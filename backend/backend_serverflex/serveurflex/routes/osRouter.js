var express = require("express");
var router = express.Router();
//const os = require("os");
const osController = require("../Controllers/osController")

/* GET users listing. */

router.get("/getInformationFromPc",osController.getOsInformatin);
router.get("/cpus",osController.osCpus)

router.get("/cpusById/:id",osController.osCpusById)

// router.get("/getInformationFromPc", function (req, res, next) {
//   try {
//     const osInformation = {
//       hostname: os.hostname(),
//       type: os.type(),
//       platform: os.platform(),
//     };
//     if (!osInformation) {
//       throw new Error("there is no information for you so");
//     }
//     res.status(200).json(osInformation);
//   } catch (error) {
//     res.status(500).json(error.message);
//   }
// });

module.exports = router;