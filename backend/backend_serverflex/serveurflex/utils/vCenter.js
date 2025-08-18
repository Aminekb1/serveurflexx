const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function getAvailableResources(vcenterConfig) {
  const { hostname, username, password } = vcenterConfig;
  const baseUrl = `https://${hostname}/rest`;

  try {
    console.log('Connecting to vCenter:', baseUrl);
    
    const authResponse = await axios.post(
      `${baseUrl}/com/vmware/cis/session`,
      {},
      {
        auth: { username, password },
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );
    console.log('Auth Response:', authResponse.data);
    const sessionId = authResponse.data.value;

    const requestConfig = {
      headers: { 'vmware-api-session-id': sessionId },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    };

    let totalResources = { cpu: 0, ram: 0, storage: 0 };
    let allocatedResources = { cpu: 0, ram: 0, storage: 0 };
    let vms = [];
    let hosts = [];
    let datastores = [];

    try {
      const hostsResponse = await axios.get(`${baseUrl}/vcenter/host`, requestConfig);
      hosts = hostsResponse.data.value || [];
      console.log('Hosts:', hosts);
    } catch (error) {
      console.error('Erreur lors de la récupération des hosts:', error.response?.data || error.message);
      throw new Error('Échec de la récupération des hosts via l\'API REST');
    }

    try {
      const vmResponse = await axios.get(`${baseUrl}/vcenter/vm`, requestConfig);
      vms = vmResponse.data.value || [];
      console.log('VMs:', vms);
    } catch (error) {
      console.error('Erreur lors de la récupération des VMs:', error.response?.data || error.message);
      throw new Error('Échec de la récupération des VMs via l\'API REST');
    }

    try {
      const datastoreResponse = await axios.get(`${baseUrl}/vcenter/datastore`, requestConfig);
      datastores = datastoreResponse.data.value || [];
      console.log('Datastores:', datastores);
    } catch (error) {
      console.error('Erreur lors de la récupération des datastores:', error.response?.data || error.message);
      throw new Error('Échec de la récupération des datastores via l\'API REST');
    }

    try {
      const { stdout, stderr } = await execPromise(
        `powershell -NoLogo -File "C:\\Users\\USER\\Documents\\serveurflex - Copie\\backend\\backend_serverflex\\serveurflex\\get-vcenter-metrics.ps1"`
      );
      if (stderr) {
        console.error('Erreur PowerCLI stderr:', stderr);
        throw new Error(stderr);
      }
      const jsonMatch = stdout.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('Aucun JSON valide trouvé dans la sortie PowerCLI');
      }
      const hostData = JSON.parse(jsonMatch[0]);
      const hostsArray = Array.isArray(hostData) ? hostData : [hostData];
      for (const host of hostsArray) {
        if (hosts.some(h => h.name === host.Name && h.connection_state === 'CONNECTED')) {
          totalResources.cpu += host.TotalCpuGHz || 0;
          allocatedResources.cpu += host.UsedCpuGHz || 0;
          totalResources.ram += host.TotalRamGB || 0;
          console.log(`Host ${host.Name} - CPU: ${host.TotalCpuGHz.toFixed(2)} GHz total, ${host.UsedCpuGHz.toFixed(2)} GHz used, RAM: ${host.TotalRamGB.toFixed(2)} GB`);
        }
      }
    } catch (powerCliError) {
      console.error('Erreur PowerCLI:', powerCliError);
      throw new Error('Échec de la récupération des métriques via PowerCLI');
    }

    let freeStorage = 0;
    for (const ds of datastores) {
      const totalSpaceGB = (ds.capacity || 0) / (1024 * 1024 * 1024);
      const freeSpaceGB = (ds.free_space || 0) / (1024 * 1024 * 1024);
      
      totalResources.storage += totalSpaceGB;
      freeStorage += freeSpaceGB;
      console.log(`Datastore ${ds.name} - Total: ${totalSpaceGB.toFixed(2)} GB, Free: ${freeSpaceGB.toFixed(2)} GB`);
    }

    for (const vm of vms) {
      try {
        const vmDetails = await axios.get(`${baseUrl}/vcenter/vm/${vm.vm}`, requestConfig);
        
        if (vmDetails.data && vmDetails.data.value) {
          const vmInfo = vmDetails.data.value;
          console.log(`VM Details (${vm.name}):`, vmInfo);

          if (vmInfo.power_state === 'POWERED_ON') {
            if (vmInfo.memory) {
              allocatedResources.ram += (vmInfo.memory.size_MiB || 0) / 1024;
            }
          }

          try {
            const diskResponse = await axios.get(`${baseUrl}/vcenter/vm/${vm.vm}/hardware/disk`, requestConfig);
            if (diskResponse.data && diskResponse.data.value) {
              for (const diskSummary of diskResponse.data.value) {
                try {
                  const diskDetails = await axios.get(
                    `${baseUrl}/vcenter/vm/${vm.vm}/hardware/disk/${diskSummary.disk}`,
                    requestConfig
                  );
                  const diskCapacity = diskDetails.data.value.capacity || 0;
                  allocatedResources.storage += diskCapacity / (1024 * 1024 * 1024);
                  console.log(`Disk ${diskSummary.disk} for VM ${vm.name} - Capacity: ${(diskCapacity / (1024 * 1024 * 1024)).toFixed(2)} GB`);
                } catch (diskDetailError) {
                  console.error(`Impossible de récupérer les détails du disque ${diskSummary.disk} pour la VM ${vm.name}:`, 
                    diskDetailError.response?.data || diskDetailError.message);
                }
              }
            }
          } catch (diskError) {
            console.error(`Impossible de récupérer les disques pour la VM ${vm.name}:`, 
              diskError.response?.data || diskError.message);
          }
        }
      } catch (vmError) {
        console.error(`Impossible de récupérer les détails pour la VM ${vm.name}:`, 
          vmError.response?.data || vmError.message);
        
        if (vm.power_state === 'POWERED_ON' && vm.memory_size_MiB) {
          allocatedResources.ram += vm.memory_size_MiB / 1024;
        }
      }
    }

    const availableResources = {
      cpu: Math.max(0, totalResources.cpu - allocatedResources.cpu),
      ram: Math.max(0, totalResources.ram - allocatedResources.ram),
      storage: Math.max(0, freeStorage),
      os: 'ubuntu',
      total: totalResources,
      allocated: allocatedResources,
      vms: vms.map(vm => ({ 
        id: vm.vm, 
        name: vm.name, 
        power_state: vm.power_state,
        cpu: vm.cpu_count || 0,
        ram: (vm.memory_size_MiB || 0) / 1024
      })),
      hosts: hosts.map(host => ({
        id: host.host,
        name: host.name,
        connection_state: host.connection_state,
        power_state: host.power_state
      })),
      datastores: datastores.map(ds => ({
        id: ds.datastore,
        name: ds.name,
        free_space: ds.free_space / (1024 * 1024 * 1024),
        capacity: ds.capacity / (1024 * 1024 * 1024)
      }))
    };

    try {
      await axios.delete(`${baseUrl}/com/vmware/cis/session`, requestConfig);
      console.log('Session fermée avec succès');
    } catch (logoutError) {
      console.error('Erreur lors de la fermeture de session:', logoutError.message);
    }

    console.log('=== RÉSUMÉ DES RESSOURCES ===');
    console.log('Ressources totales:', {
      cpu: `${totalResources.cpu.toFixed(2)} GHz`,
      ram: `${totalResources.ram.toFixed(2)} GB`,
      storage: `${totalResources.storage.toFixed(2)} GB`
    });
    console.log('Ressources allouées:', {
      cpu: `${allocatedResources.cpu.toFixed(2)} GHz`,
      ram: `${allocatedResources.ram.toFixed(2)} GB`,
      storage: `${allocatedResources.storage.toFixed(2)} GB`
    });
    console.log('Ressources disponibles:', {
      cpu: `${availableResources.cpu.toFixed(2)} GHz`,
      ram: `${availableResources.ram.toFixed(2)} GB`,
      storage: `${availableResources.storage.toFixed(2)} GB`
    });

    return availableResources;
  } catch (error) {
    console.error('Erreur vCenter:', error.response?.data || error.message);
    throw new Error(`Erreur vCenter: ${error.response?.data?.error_message || error.message}`);
  }
}

async function createVM(vcenterConfig, vmConfig) {
  const { hostname, username, password } = vcenterConfig;
  const baseUrl = `https://${hostname}/rest`;

  try {
    console.log('Création de VM dans vCenter:', vmConfig.name, 'avec ISO:', vmConfig.iso);

    const authResponse = await axios.post(
      `${baseUrl}/com/vmware/cis/session`,
      {},
      {
        auth: { username, password },
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );

    const sessionId = authResponse.data.value;
    const requestConfig = {
      headers: {
        'vmware-api-session-id': sessionId,
        'Content-Type': 'application/json'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    };

    // Récupérer les paramètres de placement
    const folderResponse = await axios.get(`${baseUrl}/vcenter/folder`, requestConfig);
    const folders = folderResponse.data.value || [];
    const vmFolder = folders.find(f => f.type === 'VIRTUAL_MACHINE')?.folder || 'group-v3';
    console.log('Available Folders:', folders);

    const datastoreResponse = await axios.get(`${baseUrl}/vcenter/datastore`, requestConfig);
    const datastores = datastoreResponse.data.value || [];
    console.log('Available Datastores:', datastores);

    let datastoreId = 'datastore-4004'; // Fallback
    let fullIsoPath = '';
    if (vmConfig.iso) {
      const match = vmConfig.iso.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        const datastoreName = match[1];
        const relativePath = match[2].replace(/\\/g, '/').replace(/^\//, '').trim();
        fullIsoPath = `[${datastoreName}] ${relativePath}`;
        console.log(`Full ISO Path: ${fullIsoPath}`);
        const matchedDatastore = datastores.find(ds => ds.name === datastoreName);
        if (!matchedDatastore) {
          throw new Error(`Datastore ${datastoreName} not found`);
        }
        datastoreId = matchedDatastore.datastore;
      } else {
        throw new Error('Invalid ISO format. Use [datastore] path/to/file.iso');
      }
    }

    const hostResponse = await axios.get(`${baseUrl}/vcenter/host`, requestConfig);
    const hosts = hostResponse.data.value || [];
    const hostId = hosts.find(h => h.connection_state === 'CONNECTED')?.host || 'host-4001';
    console.log('Available Hosts:', hosts);

    const networkResponse = await axios.get(`${baseUrl}/vcenter/network`, requestConfig);
    const networks = networkResponse.data.value || [];
    const networkId = networks.find(n => n.name === (vmConfig.network || 'VM Network'))?.network || networks[0]?.network || 'network-1053';
    console.log('Available Networks:', networks);

    const vmCreateSpec = {
      spec: {
        name: vmConfig.name,
        guest_OS: vmConfig.guestOS || 'ubuntu64Guest', // Updated to correct guest OS
        placement: {
          folder: vmFolder,
          datastore: datastoreId,
          host: hostId
        },
        cpu: {
          count: vmConfig.cpu || 1,
          cores_per_socket: 1
        },
        memory: {
          size_MiB: (vmConfig.ram || 1) * 1024
        },
        disks: vmConfig.storage ? [{
          type: 'SCSI',
          new_vmdk: {
            capacity: Math.round(vmConfig.storage * 1024 * 1024 * 1024),
            name: `${vmConfig.name}_disk`
          }
        }] : [],
        nics: vmConfig.network ? [{
          backing: {
            type: 'STANDARD_PORTGROUP',
            network: networkId
          },
          type: 'VMXNET3'
        }] : [],
        cdroms: vmConfig.iso ? [{
          type: 'IDE',
          backing: {
            type: 'ISO_FILE',
            iso_file: fullIsoPath
          },
          start_connected: true,
          allow_guest_control: true
        }] : [],
        boot: {
          type: 'BIOS',
          delay: 0,
          retry: false,
          retry_delay: 10000,
          enter_setup_mode: false
        }
      }
    };

    console.log('Datastore ID:', datastoreId);
    console.log('ISO Path in VM Spec:', fullIsoPath);
    console.log('VM Create Spec:', JSON.stringify(vmCreateSpec, null, 2));
    console.log('Sending VM creation request...');

    const createResponse = await axios.post(
      `${baseUrl}/vcenter/vm`,
      vmCreateSpec,
      requestConfig
    ).catch(error => {
      console.error('Detailed API Error:', JSON.stringify(error.response?.data, null, 2));
      if (error.response) {
        console.error('API Response Status:', error.response.status);
        console.error('API Response Headers:', error.response.headers);
        console.error('API Response Data:', error.response.data);
        const errorMessage = error.response.data?.value?.messages?.[0]?.default_message || error.message;
        throw new Error(`Failed to create VM: ${errorMessage}`);
      }
      throw error;
    });

    if (vmConfig.iso) {
      try {
        await axios.post(
          `${baseUrl}/vcenter/vm/${createResponse.data.value}/power/start`,
          {},
          requestConfig
        );
        console.log(`VM ${vmConfig.name} démarrée avec succès`);
      } catch (powerOnError) {
        console.error(`Erreur démarrage VM:`, powerOnError.response?.data || powerOnError.message);
      }
    }

    await axios.delete(`${baseUrl}/com/vmware/cis/session`, requestConfig);

    console.log('VM créée avec succès');
    return {
      vmId: createResponse.data.value,
      network: networkId,
      iso: vmConfig.iso || null
    };
  } catch (error) {
    console.error('Erreur création VM:', error.stack);
    throw new Error(`Échec création VM: ${error.response?.data?.value?.messages?.[0]?.default_message || error.message}`);
  }
}

module.exports = { getAvailableResources, createVM };