const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');
const fs = require('fs').promises; 
const net = require('net');
const { Client: SSHClient } = require('ssh2');

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

function waitForPort(host, port, timeout = 300000, interval = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkPort = () => {
      const socket = new net.Socket();
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.on('error', (err) => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for port ${port} on ${host}`));
        } else {
          setTimeout(checkPort, interval);
        }
      });
      socket.connect(port, host);
    };
    checkPort();
  });
}

async function executeSSHCommands(host, username, password, commands) {
  return new Promise((resolve, reject) => {
    const conn = new SSHClient();
    let output = '';
    conn.on('ready', () => {
      const fullCommand = commands.join(' && ');
      conn.exec(fullCommand, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        stream.on('close', (code, signal) => {
          conn.end();
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`SSH command failed with code ${code}`));
          }
        }).on('data', (data) => {
          output += data.toString();
        }).stderr.on('data', (data) => {
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).connect({
      host,
      username,
      password,
      readyTimeout: 60000,
      tryKeyboard: true
    });
  });
}

async function configureUbuntuVM(ipAddress, username, password) {
  try {
    await waitForPort(ipAddress, 22, 300000);
    const commands = [
      'sudo apt update && sudo apt upgrade -y',
      'sudo apt install -y ubuntu-desktop open-vm-tools open-vm-tools-desktop openssh-server',
      'sudo sed -i "s/#PasswordAuthentication yes/PasswordAuthentication yes/" /etc/ssh/sshd_config',
      'sudo systemctl restart ssh',
      'sudo hostnamectl set-hostname amine-virtual-machine',
      'echo "127.0.0.1 amine-virtual-machine" | sudo tee -a /etc/hosts',
      'echo "127.0.1.1 amine-virtual-machine" | sudo tee -a /etc/hosts',
      'echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf',
      'echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf',
      `sudo useradd -m -s /bin/bash ${username} || true`,
      `echo "${username}:${password}" | sudo chpasswd`,
      `sudo usermod -aG sudo ${username}`,
      'sudo systemctl daemon-reload',
      'sudo systemctl restart open-vm-tools'
    ];
    await executeSSHCommands(ipAddress, 'ubuntu', password, commands);
    return true;
  } catch (error) {
    return false;
  }
}

// Fonction pour configurer automatiquement une VM Windows
async function configureWindowsVM(ipAddress, username, password) {
  // Implémentation pour Windows similaire à Ubuntu
  // Utiliser WinRM au lieu de SSH
  console.log('Windows VM configuration would go here');
  return true;
}

async function createVM(vcenterConfig, vmConfig) {
  const { hostname, username, password } = vcenterConfig;
  const baseUrl = `https://${hostname}/rest`;

  try {
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

    const folderResponse = await axios.get(`${baseUrl}/vcenter/folder`, requestConfig);
    const folders = folderResponse.data.value || [];
    const vmFolder = folders.find(f => f.type === 'VIRTUAL_MACHINE')?.folder || 'group-v3';

    const datastoreResponse = await axios.get(`${baseUrl}/vcenter/datastore`, requestConfig);
    const datastores = datastoreResponse.data.value || [];

    let datastoreId = 'datastore-4004';
    let fullIsoPath = '';
    if (vmConfig.iso) {
      const match = vmConfig.iso.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        const datastoreName = match[1];
        const relativePath = match[2].replace(/\\/g, '/').replace(/^\//, '').trim();
        fullIsoPath = `[${datastoreName}] ${relativePath}`;
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

    const networkResponse = await axios.get(`${baseUrl}/vcenter/network`, requestConfig);
    const networks = networkResponse.data.value || [];
    const networkId = networks.find(n => n.name === (vmConfig.network || 'VM Network'))?.network || networks[0]?.network || 'network-1053';

    const vmCreateSpec = {
      spec: {
        name: vmConfig.name,
        guest_OS: vmConfig.guestOS || 'ubuntu64Guest',
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

    const createResponse = await axios.post(
      `${baseUrl}/vcenter/vm`,
      vmCreateSpec,
      requestConfig
    ).catch(error => {
      if (error.response) {
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
        let ipAddress = null;
        let attempts = 0;
        const maxAttempts = 30;
        while (!ipAddress && attempts < maxAttempts) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 10000));
          try {
            const guestResponse = await axios.get(
              `${baseUrl}/vcenter/vm/${createResponse.data.value}/guest/networking/interfaces`,
              requestConfig
            );
            const interfaces = guestResponse.data.value || [];
            for (const iface of interfaces) {
              if (iface.ip && iface.ip.ip_addresses) {
                const ipv4 = iface.ip.ip_addresses.find(addr => 
                  addr.ip_address && addr.ip_address.includes('.') && !addr.ip_address.startsWith('169.254.')
                );
                if (ipv4) {
                  ipAddress = ipv4.ip_address;
                  break;
                }
              }
            }
            if (ipAddress) {
              if (vmConfig.guestOS.includes('ubuntu') || vmConfig.guestOS.includes('linux')) {
                await configureUbuntuVM(ipAddress, 'amine', 'rootroot');
              } else if (vmConfig.guestOS.includes('windows')) {
                await configureWindowsVM(ipAddress, 'Administrator', 'rootroot');
              }
              break;
            }
          } catch (ipError) {
          }
        }
      } catch (powerOnError) {
      }
    }

    await axios.delete(`${baseUrl}/com/vmware/cis/session`, requestConfig);
    return {
      vmId: createResponse.data.value,
      network: networkId,
      iso: vmConfig.iso || null
    };
  } catch (error) {
    throw new Error(`Échec création VM: ${error.response?.data?.value?.messages?.[0]?.default_message || error.message}`);
  }
}

async function getVMDetails(vcenterConfig, vmId) {
  const { hostname, username, password } = vcenterConfig;
  const baseUrl = `https://${hostname}/rest`;

  try {
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
      headers: { 'vmware-api-session-id': sessionId },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    };

    const vmResponse = await axios.get(`${baseUrl}/vcenter/vm/${vmId}`, requestConfig);
    const vmInfo = vmResponse.data.value;
    console.log(`VM Details (${vmInfo.name}):`, vmInfo);

    const tempScriptPath = path.join(__dirname, 'temp_get_vm_details.ps1');
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
        Connect-VIServer -Server ${hostname} -User "${username}" -Password "${password}" -Force -ErrorAction Stop;
        Write-Output "Connected to vCenter successfully at $(Get-Date)";
      } catch {
        Write-Output "Failed to connect to vCenter: $_ at $(Get-Date)";
        exit 1;
      }
      Write-Output "Searching for VM with name: ${vmInfo.name}";
      $vm = Get-VM -Name "${vmInfo.name}" -ErrorAction Stop;
      if ($vm) {
        Write-Output "VM found: $($vm.Name) with ID $($vm.Id) at $(Get-Date)";
        $guest = $vm | Get-VMGuest -ErrorAction SilentlyContinue;
        $ip = if ($guest) { $guest.IPAddress | Where-Object { $_ -match '\\d+\\.\\d+\\.\\d+\\.\\d+' } | Select-Object -First 1 } else { $null };
        $os = if ($guest) { $guest.OSFullName } else { $vm.GuestId };
        $powerState = $vm.PowerState;
        Write-Output "VM_JSON_START";
        Write-Output (@{
          name = $vm.Name;
          ipAddress = $ip;
          os = $os;
          powerState = $powerState;
          username = 'amine';
          password = 'rootroot';
        } | ConvertTo-Json -Depth 3);
        Write-Output "VM_JSON_END";
      } else {
        Write-Output "VM with name ${vmInfo.name} not found at $(Get-Date)";
        Write-Output '{}';
      }
      Disconnect-VIServer -Server * -Force -Confirm:$false -ErrorAction SilentlyContinue;
      Write-Output "Ending PowerCLI script execution at $(Get-Date)";
    `.trim();

    await fs.writeFile(tempScriptPath, powerCliCommand, 'utf8');
    console.log('Temporary script created at:', tempScriptPath);

    const { stdout, stderr } = await execPromise(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${tempScriptPath}"`
    );
    if (stderr) {
      console.error('Erreur PowerCLI stderr:', stderr.toString());
      throw new Error(stderr.toString());
    }
    console.log('PowerCLI raw output:', stdout.toString());
    const output = stdout.toString().trim();
    const jsonStart = output.indexOf('VM_JSON_START');
    const jsonEnd = output.indexOf('VM_JSON_END');

    let vmDetails = {};
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonOutput = output.substring(jsonStart + 'VM_JSON_START'.length, jsonEnd).trim();
      vmDetails = JSON.parse(jsonOutput);
    }

    if (!vmDetails.ipAddress) {
      const guestResponse = await axios.get(`${baseUrl}/vcenter/vm/${vmId}/guest/networking/interfaces`, requestConfig);
      const interfaces = guestResponse.data.value || [];
      const ipAddress = interfaces.find(iface => iface.ip?.ip_addresses?.length > 0)?.ip.ip_addresses.find(addr => addr.ip_address.includes('.'))?.ip_address;
      if (ipAddress) vmDetails.ipAddress = ipAddress;
    }

    const protocol = vmDetails.os && vmDetails.os.toLowerCase().includes('windows') ? 'rdp' : 'ssh';

    await fs.unlink(tempScriptPath);
    console.log('Temporary script removed');

    await axios.delete(`${baseUrl}/com/vmware/cis/session`, requestConfig);

    return {
      ...vmDetails,
      protocol: protocol,
      instructions: protocol === 'ssh'
        ? 'Utilisez un client SSH (ex. PuTTY ou terminal) avec ces identifiants.'
        : 'Utilisez un client RDP (ex. Connexion Bureau à Distance Windows) avec ces identifiants.'
    };
  } catch (error) {
    console.error('Erreur getVMDetails:', error.message, error.stack);
    throw new Error(`Échec récupération détails VM: ${error.message}`);
  }
}
async function getVMConsoleUrl(vcenterConfig, vmId) {
  const { hostname, username, password } = vcenterConfig;
  const baseUrl = `https://${hostname}/rest`;

  try {
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
      headers: { 'vmware-api-session-id': sessionId },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    };

    console.log(`Requesting console ticket for VM ${vmId} at ${baseUrl}/vcenter/vm/${vmId}/console/tickets`);
    const ticketResponse = await axios.post(
      `${baseUrl}/vcenter/vm/${vmId}/console/tickets`,
      {
        spec: {
          type: 'HTML5',
          ticket: {
            ticket: '', // Will be filled by vCenter
            user_name: `${process.env.VCENTER_DOMAIN || 'vsphere.local'}\\{username}`.replace('{username}', username)
          }
        }
      },
      requestConfig
    );

    const ticket = ticketResponse.data.value.ticket;
    const consoleUrl = `https://${hostname}/ui/webconsole.html?vmId=${vmId}&ticket=${ticket}&sessionTicket=${sessionId}`;
    await axios.delete(`${baseUrl}/com/vmware/cis/session`, requestConfig);
    return consoleUrl;
  } catch (error) {
    console.error('Erreur getVMConsoleUrl Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    console.error('Full error stack:', error.stack);
    throw new Error(`Échec récupération URL console: ${error.response?.data?.messages?.[0]?.default_message || error.message}`);
  }
}
module.exports = { getAvailableResources, createVM, getVMDetails, getVMConsoleUrl, configureUbuntuVM, configureWindowsVM, waitForPort, executeSSHCommands };