const factureModel = require("../models/factureModel");
const userModel = require("../models/userModel");
const commandeModel = require("../models/commandeModel");
const ressourceModel = require("../models/ressourceModel");

module.exports.getAllFactures = async (req, res) => {
  try {
    const factures = await factureModel.find().populate("client commande");
    if (factures.length === 0) {
      throw new Error("Factures not found");
    }
    res.status(200).json(factures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.createFacture = async (req, res) => {
  try {
    const { id, montant, methodePaiement, statutPaiement, client, commande } = req.body;
    const facture = new factureModel({id, montant, methodePaiement, statutPaiement, client, commande });
    await facture.save();
    await userModel.findByIdAndUpdate(client, { $push: { factures: facture._id } });
    res.status(201).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getFactureById = async (req, res) => {
  try {
    const { id } = req.params;
    const facture = await factureModel.findById(id)
      .populate({
        path: 'commande',
        populate: { path: 'ressources', model: 'Ressource' }
      })
      .populate('client');
    if (!facture) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }
    res.json(facture);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports.deleteFactureById = async (req, res) => {
  try {
    const { id } = req.params;
    const facture = await factureModel.findByIdAndDelete(id);
    if (!facture) {
      return res.status(404).json({ message: "Facture not found" });
    }
    await userModel.updateMany({}, { $pull: { factures: facture._id } });
    res.status(200).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateFacture = async (req, res) => {
  try {
    const { id } = req.params;
    const { montant, methodePaiement, statutPaiement, effectuerPaiement, annulerPaiement } = req.body;
    const facture = await factureModel.findByIdAndUpdate(id, {
      $set: { montant, methodePaiement, statutPaiement, effectuerPaiement, annulerPaiement }
    }, { new: true });
    if (!facture) {
      return res.status(404).json({ message: "Facture not found" });
    }
    res.status(200).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateStatutPaiement = async (req, res) => {
  try {
    const { id } = req.params;
    const { statutPaiement } = req.body;
    const facture = await factureModel.findByIdAndUpdate(id, {
      $set: { statutPaiement }
    }, { new: true });
    if (!facture) {
      return res.status(404).json({ message: "Facture not found" });
    }
    res.status(200).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*module.exports.calculateTotal = async (req, res) => {
  try {
    const { id } = req.params;
    const facture = await factureModel.findById(id).populate({
      path: 'commande',
      populate: { path: 'ressources', model: 'Ressource' }
    });
    if (!facture || !facture.commande) {
      return res.status(404).json({ message: 'Facture ou commande introuvable' });
    }
    const total = facture.commande.ressources.reduce((sum, r) => {
      const prixUnitaire = r.prix || 0;
      const heures = r.nombreHeure || 1;
      return sum + (prixUnitaire * heures);
    }, 0);
    res.json({ total });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
 */
module.exports.calculateTotal = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Recherche par ID métier (correction clé)
    const facture = await factureModel.findOne({ id }).populate({
      path: 'commande',
      populate: {
        path: 'ressources',
        model: 'Ressource',
        select: 'prix nombreHeure' // Optimisation
      }
    });

    if (!facture) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }
/* 
     if (!facture.commande?.ressources?.length) {
      return res.status(400).json({ 
        message: 'Aucune ressource trouvée dans la commande' 
      });
    }  */

    // 2. Calcul sécurisé
    const total = facture.commande.ressources.reduce((sum, ressource) => {
      const prix = Number(ressource.prix) || 0;
      const heures = Number(ressource.nombreHeure) || 1;
      return sum + (prix * heures);
    }, 0);

    // 3. Mise à jour facultative de la facture
    await factureModel.updateOne({ id }, { $set: { montant: total } });

    res.json({ 
      success: true,
      total,
      devise: "€",
      details: facture.commande.ressources.map(r => ({
        ressource: r._id,
        prix: r.prix,
        heures: r.nombreHeure
      }))
    });

  } catch (e) {
    console.error('Erreur calculateTotal:', e);
    res.status(500).json({ 
      message: 'Erreur de calcul',
      error: e.message 
    });
  }
};
module.exports.payerFacture = async (req, res) => {
  try {
    const { id } = req.params;
    const { methodePaiement } = req.body;
    const facture = await factureModel.findById(id);
    if (!facture) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }
    if (facture.statutPaiement === 'payé') {
      return res.status(400).json({ message: 'Facture déjà payée' });
    }
    facture.methodePaiement = methodePaiement || facture.methodePaiement;
    facture.statutPaiement = 'payé';
    facture.effectuerPaiement = true;
    await facture.save();
    res.status(200).json(facture);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
module.exports.generatePdf = async (req, res) => {
  try {
    const { latex } = req.body;
    const tempFile = `/tmp/invoice_${Date.now()}.tex`;
    const pdfFile = `/tmp/invoice_${Date.now()}.pdf`;

    // Write LaTeX content to a temporary file
    await fs.writeFile(tempFile, latex);

    // Compile LaTeX to PDF using latexmk
    await new Promise((resolve, reject) => {
      exec(`latexmk -pdf ${tempFile} -output-directory=/tmp`, (err, stdout, stderr) => {
        if (err) {
          console.error('LaTeX Compilation Error:', stderr);
          reject(new Error(`LaTeX compilation failed: ${stderr}`));
          return;
        }
        resolve();
      });
    });

    // Move the generated PDF (latexmk might place it in the same directory)
    await fs.rename(`${tempFile.replace('.tex', '.pdf')}`, pdfFile);

    // Read PDF and send as response
    const pdfBuffer = await fs.readFile(pdfFile);
    res.set('Content-Type', 'application/pdf');
    res.send(pdfBuffer);

    // Clean up temporary files
    await Promise.all([
      fs.unlink(tempFile),
      fs.unlink(pdfFile)
    ]);
  } catch (error) {
    console.error('Generate PDF Error:', error.message);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
};