Import-Module VMware.PowerCLI -NoClobber -WarningAction SilentlyContinue
$vcenter = "192.168.100.46"
$username = "administrator@vsphere.local"
$password = "Ma1920++"
Connect-VIServer -Server $vcenter -User $username -Password $password -Force -WarningAction SilentlyContinue
$hostData = Get-VMHost | Select-Object Name, @{N="TotalCpuGHz";E={[math]::Round(($_.CpuTotalMhz / 1000), 2)}}, @{N="UsedCpuGHz";E={[math]::Round(($_.CpuUsageMhz / 1000), 2)}}, @{N="TotalRamGB";E={[math]::Round(($_.MemoryTotalGB), 2)}} | ConvertTo-Json
Write-Output $hostData
Disconnect-VIServer -Server $vcenter -Confirm:$false -WarningAction SilentlyContinue