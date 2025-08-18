Write-Output "Starting PowerCLI script execution at $(Get-Date)";
        try {
          Import-Module VMware.PowerCLI -ErrorAction Stop;
          Write-Output "PowerCLI module loaded successfully at $(Get-Date)";
        } catch {
          Write-Output "Failed to load PowerCLI module: $_ at $(Get-Date)";
          exit 1;
        }
        try {
          Connect-VIServer -Server 192.168.100.46 -User "administrator@vsphere.local" -Password "Ma1920++" -Force -ErrorAction Stop;
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
            $isos | Select-Object -Property Name,@{Name='Path';Expression={$_.FullName.Replace($datastore.DatastoreBrowserPath, '').TrimStart('')}},@{Name='FullPath';Expression={'[datastore1 (1)] ' + $_.FullName.Replace($datastore.DatastoreBrowserPath, '').TrimStart('')}} | ConvertTo-Json -Depth 3;
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