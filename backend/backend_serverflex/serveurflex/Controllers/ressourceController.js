const express = require("express");
const Ressource = require("../models/ressourceModel");
const panierModel = require("../models/panierModel");
const axios = require("axios");
const catalogueModel = require("../models/catalogueModel");
const { getAvailableResources, createVM } = require('../utils/vCenter');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Ajout des limites de payload ici (au lieu de server.js)
const router = express.Router();
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));
const osMapping = {
  ubuntu: 'UBUNTU_64',
  windows: 'WINDOWS_9_64',
  linux: 'OTHER_LINUX_64',
  macOs: 'DARWIN_64', // macOS
  CentOs: 'CENTOS_64'
};

// Récupérer toutes les ressources
module.exports.getAllRessources = async (req, res) => {
  try {
    const ressources = await Ressource.find();
    if (ressources.length === 0) {
      return res.status(404).json({ message: "Aucune ressource trouvée" });
    }
    res.status(200).json(ressources);
  } catch (error) {
    console.error("Erreur getAllRessources:", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération des ressources" });
  }
};

// Ajouter une ressource
module.exports.addRessource = async (req, res) => {
  try {
    const { id, nom, cpu, typeRessource, ram, stockage, nombreHeure, disponibilite, statut, image, os, network, iso } = req.body;

    if (!nom || !cpu || !ram || !stockage || !os) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const ressource = new Ressource({ id, nom, cpu, typeRessource, ram, stockage, nombreHeure, disponibilite, statut, image, os, network, iso });
    await ressource.save();
    res.status(201).json(ressource);
  } catch (error) {
    console.error("Erreur addRessource:", error.message);
    res.status(500).json({ message: "Erreur lors de l'ajout de la ressource" });
  }
};

// Mettre à jour une ressource
module.exports.updateRessource = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRessource = await Ressource.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });

    if (!updatedRessource) {
      return res.status(404).json({ message: 'Ressource introuvable' });
    }

    res.status(200).json(updatedRessource);
  } catch (error) {
    console.error("Erreur updateRessource:", error.message);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la ressource" });
  }
};

// Récupérer une ressource par ID
module.exports.getRessourceById = async (req, res) => {
  try {
    const ressource = await Ressource.findById(req.params.id);
    if (!ressource) {
      return res.status(404).json({ message: "Ressource introuvable" });
    }
    res.status(200).json(ressource);
  } catch (error) {
    console.error("Erreur getRessourceById:", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération de la ressource" });
  }
};

// Supprimer une ressource
module.exports.deleteRessourceById = async (req, res) => {
  try {
    const ressource = await Ressource.findByIdAndDelete(req.params.id);
    if (!ressource) {
      return res.status(404).json({ message: "Ressource introuvable" });
    }
    await catalogueModel.updateMany({}, { $pull: { ressourcesDisponibles: ressource._id } });
    res.status(200).json(ressource);
  } catch (error) {
    console.error("Erreur deleteRessourceById:", error.message);
    res.status(500).json({ message: "Erreur lors de la suppression de la ressource" });
  }
};

// Récupérer les ressources disponibles depuis vCenter
module.exports.getAvailableResources = async (req, res) => {
  try {
    const vcenterConfig = {
      hostname: process.env.VCENTER_HOST,
      username: process.env.VCENTER_USERNAME,
      password: process.env.VCENTER_PASSWORD,
    };

    const resources = await getAvailableResources(vcenterConfig);
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json(resources);
  } catch (error) {
    console.error("Erreur connexion vCenter:", error.message);
    if (error.message.includes("ECONNREFUSED") || error.message.includes("ENOTFOUND") || error.message.includes("connect")) {
      return res.status(503).json({ message: "Impossible de se connecter au vCenter. Vérifiez qu'il est en ligne." });
    }
    res.status(500).json({ message: "Erreur lors de la récupération des ressources depuis vCenter" });
  }
};

// Créer une VM personnalisée
module.exports.createCustomVM = async (req, res) => {
  try {
    const { nom, cpu, ram, stockage, nombreHeure, os, network, iso } = req.body;

    // Validation des champs
    if (!nom || cpu == null || ram == null || stockage == null || nombreHeure == null || !os) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const parsedCpu = parseInt(cpu, 10);
    const parsedRam = parseInt(ram, 10);
    const parsedStockage = parseFloat(stockage);
    const parsedNombreHeure = parseInt(nombreHeure, 10);

    if (isNaN(parsedCpu) || isNaN(parsedRam) || isNaN(parsedStockage) || isNaN(parsedNombreHeure)) {
      return res.status(400).json({ message: 'Format de nombre invalide pour CPU, RAM, stockage ou nombreHeure' });
    }

    const vcenterConfig = {
      hostname: process.env.VCENTER_HOST,
      username: process.env.VCENTER_USERNAME,
      password: process.env.VCENTER_PASSWORD,
    };

    // Vérifier les ressources disponibles
    let availableResources;
    try {
      availableResources = await getAvailableResources(vcenterConfig);
    } catch (vcError) {
      return res.status(503).json({ message: "Impossible de vérifier les ressources disponibles car le vCenter est hors ligne." });
    }

    if (parsedCpu > availableResources.cpu || parsedRam > availableResources.ram || parsedStockage > availableResources.storage) {
      return res.status(400).json({
        message: 'Les ressources demandées dépassent les ressources disponibles',
        available: availableResources,
      });
    }

    // Vérifier si l'ISO existe (utiliser les données de getAvailableISOs)
    if (iso) {
      console.log('ISO to verify:', iso);
      const isoResponse = await axios.get(`http://localhost:5000/ressource/getAvailableISOs`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      const availableIsos = isoResponse.data;
      const normalizedIso = iso.replace(/\\/g, '/');
      const isoFound = availableIsos.some(availableIso => availableIso.fullPath === normalizedIso);
      if (!isoFound) {
        return res.status(400).json({ message: `L'ISO ${iso} n'existe pas dans les datastores disponibles` });
      }
    }

    // Créer la VM dans vCenter
    const vmConfig = {
      name: nom,
      cpu: parsedCpu,
      ram: parsedRam,
      storage: parsedStockage,
      guestOS: osMapping[os] || 'UBUNTU_64',
      network,
      iso // Passer le chemin de l'ISO
    };

    let vmResult;
    try {
      vmResult = await createVM(vcenterConfig, vmConfig);
    } catch (vmError) {
      console.error("Erreur lors de la création de la VM dans vCenter:", vmError.message);
      return res.status(500).json({ message: "Échec de la création de la VM dans vCenter" });
    }

    // Enregistrer la ressource dans MongoDB
    const ressource = new Ressource({
      id: vmResult.vmId,
      nom,
      cpu: parsedCpu,
      ram: parsedRam,
      stockage: parsedStockage,
      nombreHeure: parsedNombreHeure,
      disponibilite: true,
      statut: 'Active',
      typeRessource: 'vm',
      os,
      network: vmResult.network,
      iso: vmResult.iso // Stocker le chemin de l'ISO
    });

    await ressource.save();
    res.status(201).json({ ressource });
  } catch (error) {
    console.error("Erreur createCustomVM:", error.message);
    res.status(500).json({ message: "Erreur lors de la création de la VM" });
  }
};
// Récupérer les réseaux disponibles
module.exports.getAvailableNetworks = async (req, res) => {
  try {
    const vcenterConfig = {
      hostname: process.env.VCENTER_HOST,
      username: process.env.VCENTER_USERNAME,
      password: process.env.VCENTER_PASSWORD,
    };

    const baseUrl = `https://${vcenterConfig.hostname}/rest`;
    const authResponse = await axios.post(
      `${baseUrl}/com/vmware/cis/session`,
      {},
      {
        auth: { username: vcenterConfig.username, password: vcenterConfig.password },
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );

    const sessionId = authResponse.data.value;
    const requestConfig = {
      headers: { 
        'vmware-api-session-id': sessionId,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    };

    const networkResponse = await axios.get(`${baseUrl}/vcenter/network`, requestConfig);
    const networks = networkResponse.data.value || [];

    await axios.delete(`${baseUrl}/com/vmware/cis/session`, requestConfig);

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json(networks);
  } catch (error) {
    console.error('Erreur lors de la récupération des réseaux:', error.response?.data || error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des réseaux' });
  }
};

// Récupérer les ISOs disponibles
module.exports.getAvailableISOs = async (req, res) => {
  try {
    const vcenterConfig = {
      hostname: process.env.VCENTER_HOST,
      username: process.env.VCENTER_USERNAME,
      password: process.env.VCENTER_PASSWORD,
    };

    console.log('Tentative de récupération des ISOs via PowerCLI...');
    const isos = [];
    try {
      const tempScriptPath = path.join(__dirname, 'temp_get_isos.ps1');
      const powerCliCommand = `
        Write-Output "Starting PowerCLI script execution at $(Get-Date)";
        try {
          Import-Module VMware.PowerCLI -ErrorAction Stop;
          Write-Output "PowerCLI module loaded successfully at $(Get-Date)";
        } catch {
          Write-Output "Failed to load PowerCLI module: $_ at $(Get-Date)";
          exit 1;
        }
        try {
          Connect-VIServer -Server ${vcenterConfig.hostname} -User "${vcenterConfig.username}" -Password "${vcenterConfig.password}" -Force -ErrorAction Stop;
          Write-Output "Connected to vCenter successfully at $(Get-Date)";
        } catch {
          Write-Output "Failed to connect to vCenter: $_ at $(Get-Date)";
          exit 1;
        }
        $datastores = Get-Datastore -ErrorAction Stop;
        Write-Output "Datastores found: $($datastores.Name -join ',') at $(Get-Date)";
        $datastore = $datastores | Where-Object {$_.Name -eq 'datastore1 (1)'};
        if ($datastore) {
          Write-Output "Datastore found: $($datastore.Name) at $(Get-Date)";
          Write-Output "Testing datastore path: $($datastore.DatastoreBrowserPath)";
          $isos = Get-ChildItem -Path $datastore.DatastoreBrowserPath -Filter '*.iso' -Recurse -ErrorAction Stop;
          if ($isos) {
            Write-Output "ISOs_JSON_START";
            $isos | Select-Object -Property Name,@{Name='Path';Expression={$_.FullName.Replace($datastore.DatastoreBrowserPath, '').TrimStart('\')}},@{Name='FullPath';Expression={'[datastore1 (1)] ' + $_.FullName.Replace($datastore.DatastoreBrowserPath, '').TrimStart('\')}} | ConvertTo-Json -Depth 3;
            Write-Output "ISOs_JSON_END";
          } else {
            Write-Output "No ISOs found in datastore at $(Get-Date)";
            Write-Output '[]'
          }
        } else {
          Write-Output "Datastore 'datastore1 (1)' not found at $(Get-Date)";
          Write-Output '[]'
        }
        Disconnect-VIServer -Server * -Force -Confirm:$false -ErrorAction SilentlyContinue;
        Write-Output "Ending PowerCLI script execution at $(Get-Date)";
      `.trim();

      // Write the script to a temporary file
      await fs.writeFile(tempScriptPath, powerCliCommand, 'utf8');
      console.log('Temporary script created at:', tempScriptPath);

      // Execute the script
      const { stdout, stderr } = await execPromise(
        `powershell -NoProfile -ExecutionPolicy Bypass -File "${tempScriptPath}"`
      );
      if (stderr) {
        console.error('Erreur PowerCLI stderr:', stderr.toString());
      }
      console.log('PowerCLI raw output:', stdout.toString());
      const output = stdout.toString().trim();
      const jsonStart = output.indexOf('ISOs_JSON_START');
      const jsonEnd = output.indexOf('ISOs_JSON_END');

      let jsonOutput = '[]';
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonOutput = output.substring(jsonStart + 'ISOs_JSON_START'.length, jsonEnd).trim();
      }

      console.log('Extracted JSON:', jsonOutput);
      let powerCliIsos;
      try {
        powerCliIsos = JSON.parse(jsonOutput);
        // Normaliser la réponse en tableau
        if (!Array.isArray(powerCliIsos)) {
          if (powerCliIsos && typeof powerCliIsos === 'object' && powerCliIsos.Path) {
            powerCliIsos = [powerCliIsos]; // Convertir en tableau
          } else {
            powerCliIsos = [];
          }
        }
        
        // Nettoyer les chemins et ajouter aux résultats
        powerCliIsos.forEach(iso => {
          if (iso.Path && iso.FullPath) {
            isos.push({
              datastore: 'datastore1 (1)',
              path: iso.Path.replace(/\\+/g, '/'), // Remplacer les \ par /
              fullPath: iso.FullPath.replace(/\\+/g, '/') // Remplacer les \ par /
            });
          }
        });
      } catch (parseError) {
        console.error('Erreur lors du parsing JSON:', parseError.message);
        powerCliIsos = [];
      }

      // Clean up temporary file
      await fs.unlink(tempScriptPath);
      console.log('Temporary script removed');
    } catch (powerCliError) {
      console.error('Erreur lors de la récupération des ISOs via PowerCLI:', powerCliError.message, powerCliError.stack);
    }

    if (isos.length === 0) {
      console.warn('Aucun fichier ISO trouvé dans les datastores');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json([]);
    }

    console.log('ISOs found:', JSON.stringify(isos, null, 2));
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json(isos);
  } catch (error) {
    console.error('Erreur lors de la récupération des ISOs:', error.message, error.stack);
    res.status(500).json({ message: 'Erreur lors de la récupération des ISOs' });
  }
};
// Retirer une ressource d'un client
module.exports.removeResourceFromClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const ressource = await Ressource.findById(id);
    if (!ressource) {
      return res.status(404).json({ message: "Ressource introuvable" });
    }

    const commands = await commandeModel.find({ client: userId, ressources: id, status: 'accepté' });

    if (commands.length === 0) {
      return res.status(400).json({ message: "Cette ressource n'est pas allouée à votre compte" });
    }

    await commandeModel.updateMany(
      { client: userId, ressources: id },
      { $pull: { ressources: id } }
    );

    const remainingCommands = await commandeModel.find({ ressources: id });
    if (remainingCommands.length === 0) {
      await Ressource.findByIdAndUpdate(id, { disponibilite: true, allocatedStart: null });
    }

    res.status(200).json({ message: "Ressource retirée de votre allocation avec succès" });
  } catch (error) {
    console.error("Erreur removeResourceFromClient:", error.message);
    res.status(500).json({ message: "Erreur lors du retrait de la ressource" });
  }
};