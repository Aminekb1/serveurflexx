var express = require("express");
var router = express.Router();
const userController = require("../Controllers/userController")

const uploadfile = require("../middlewares/uploadFileMiddlewares")
const {requireAuthUser} = require("../middlewares/authMiddleware")
const {controledAcces} = require("../middlewares/controledAcces")

/* GET users listing. */

router.get("/getAllUsers",userController.getAllUsers);

router.get("/getUserById/:id",userController.getUserById);

router.post("/addClient",userController.addClient);

router.post("/addClientWithImg",uploadfile.single("image_User"),userController.addClientWithImg);
//router.post("/addtopanier",userController.addToPanier);

router.post("/addAdmin",userController.addAdmin);
router.post("/getUserByEmail",userController.getUserByEmail);

//router.get("/getUserByEmail",userController.getUserByEmail);

router.put("/updateUser/:id",userController.updateUser);

router.put("/updatePassword/:id",userController.updatePassword);

router.delete("/deleteUserById/:id",userController.deleteUserById);

router.get("/AllAdmin", requireAuthUser, userController.getAdmin);

/* GET users Simple. */
router.get("/AllClient", requireAuthUser, userController.getClient);

router.post("/login",userController.loginUser);

//router.post('/loginUser',userController.login );
router.post('/logout',requireAuthUser,userController.logout );
router.post("/signup", userController.signup);

module.exports = router;