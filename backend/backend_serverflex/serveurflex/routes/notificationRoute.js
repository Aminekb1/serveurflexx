const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/notificationController");
const { requireAuthUser } = require('../middlewares/authMiddleware');


router.get("/getAllNotifications", notificationController.getAllNotifications);
router.post("/createNotification", notificationController.createNotification);
router.get("/getNotificationById/:id", notificationController.getNotificationById);
router.delete("/deleteNotificationById/:id", notificationController.deleteNotificationById);
router.put("/markAsRead/:id", notificationController.markAsRead);
router.post("/send-confirmation", requireAuthUser, notificationController.sendConfirmation);

module.exports = router;