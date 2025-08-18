const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');

// controllers/notificationController.js


/* const sendgrid          = require('@sendgrid/mail');
const twilio            = require('twilio');

// Configure SendGrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Configure Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
); */

module.exports = {
  getAllNotifications: async (req, res) => {
    try {
      const notifications = await notificationModel.find().populate("user");
      if (notifications.length === 0) {
        throw new Error("Notifications not found");
      }
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createNotification: async (req, res) => {
    try {
      const {  type, message, userId } = req.body;
      const notification = new notificationModel({ type, message, user: userId, dateEnvoi: new Date() });
      await notification.save();
      await userModel.findByIdAndUpdate(userId, { $push: { notifications: notification._id } });
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getNotificationById: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await notificationModel.findById(id).populate("user");
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteNotificationById: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await notificationModel.findByIdAndDelete(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      await userModel.updateMany({}, { $pull: { notifications: notification._id } });
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await notificationModel.findByIdAndUpdate(id, { $set: { lu: true } }, { new: true });
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
   /**
   * Envoie un email et/ou un SMS de confirmation d'allocation de ressource
   * et demande à l'utilisateur de répondre OUI/NON pour valider.
   * Body attendu : { userId, resourceName, method: 'email'|'sms'|'both' }
   */
   sendConfirmation: async (req, res) => {
    try {
      const { userId, resourceName, method } = req.body;
      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

      const confirmationText = 
        `Bonjour ${user.nom},\n\n` +
        `Votre ressource "${resourceName}" a été allouée avec succès.\n\n` +
        `Merci de confirmer votre achat ou allocation de ressource :\n` +
        `- Répondez "OUI" pour accepter.\n` +
        `- Répondez "NON" pour refuser.\n\n` +
        `— L’équipe ServeurFlex`;

      const confirmationHtml = 
        `<p>Bonjour <strong>${user.nom}</strong>,</p>` +
        `<p>Votre ressource <em>"${resourceName}"</em> a été allouée avec succès.</p>` +
        `<p>Merci de confirmer votre achat ou allocation de ressource :</p>` +
        `<ul>` +
          `<li>Répondez <strong>OUI</strong> pour accepter.</li>` +
          `<li>Répondez <strong>NON</strong> pour refuser.</li>` +
        `</ul>` +
        `<p>— L’équipe ServeurFlex</p>`;

      const results = [];

      // -- Envoi e-mail via SendGrid --
      if (method === 'email' || method === 'both') {
        await sendgrid.send({
          to: user.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'Confirmation d’allocation de ressource',
          text: confirmationText,
          html: confirmationHtml
        });
        results.push('Email de confirmation envoyé');
      }

      // -- Envoi SMS via Twilio --
      if (method === 'sms' || method === 'both') {
        if (!user.phone) {
          return res
            .status(400)
            .json({ message: "L'utilisateur n’a pas de numéro de téléphone" });
        }
        await twilioClient.messages.create({
          body: confirmationText,
          from: process.env.TWILIO_FROM_NUMBER,
          to: user.phone
        });
        results.push('SMS de confirmation envoyé');
      }

      // -- Sauvegarde de la notification en base --
      const note = new notificationModel({
        type: method === 'sms' ? 'SMS' : 'Email',
        message: `Confirmation demandée pour allocation de "${resourceName}"`,
        user: user._id
      });
      await note.save();
      await userModel.findByIdAndUpdate(user._id, {
        $push: { notifications: note._id }
      });

      res.json({ status: 'ok', details: results });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } 
};