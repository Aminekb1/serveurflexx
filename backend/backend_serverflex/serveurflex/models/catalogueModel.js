const mongoose = require("mongoose");

const catalogueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ressources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ressource" }],
});

module.exports = mongoose.model("Catalogue", catalogueSchema);