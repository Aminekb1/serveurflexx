import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';
import { Dropdown } from 'flowbite-react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

const SystemHealthStats = () => {
  const BASE_URL = 'http://localhost:8000';

  // State for chart data
  const [datastoreUsage, setDatastoreUsage] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
  const [vmNetworkUsage, setVmNetworkUsage] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
  const [maintenanceMode, setMaintenanceMode] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });

  // Dropdown actions
  const Action = [
    { icon: 'solar:add-circle-outline', listtitle: 'Refresh' },
    { icon: 'solar:pen-new-square-broken', listtitle: 'Export' },
  ];

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Datastore Usage
        const datastoreRes = await axios.get(`${BASE_URL}/stats/datastore-usage`);
        const datastoreData = datastoreRes.data.data;
        setDatastoreUsage({
          labels: ['Used Space (MiB)', 'Free Space (MiB)'],
          series: [datastoreData.used_space || 0, datastoreData.free_space || 0],
        });

        // VM Network Usage
        const networkRes = await axios.get(`${BASE_URL}/stats/vm-network-usage`);
        const networkData = networkRes.data.data;
        setVmNetworkUsage({
          labels: networkData.map((item: any) => `${item.nic_count || 'Unknown'} NICs`),
          series: networkData.map((item: any) => item.count),
        });

        // Maintenance Mode Servers
        const maintenanceRes = await axios.get(`${BASE_URL}/stats/maintenance-mode-servers`);
        const maintenanceData = maintenanceRes.data.data;
        setMaintenanceMode({
          labels: maintenanceData.map((item: any) => item.maintenance_mode === true ? 'In Maintenance' : 'Operational'),
          series: maintenanceData.map((item: any) => item.count),
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchData();
  }, []);

  // Common chart options for Donut Charts
  const chartOptions = (title: string): ApexOptions => ({
    chart: {
      type: 'donut' as const, // Explicitly set to 'donut' to satisfy ApexOptions
      height: 200,
      fontFamily: 'inherit',
      toolbar: { show: false },
    },
    labels: [],
    colors: ['#fd6c9e','#cca9dd', '#26c4ec', '#6d11d6', '#ad28ed', '#18f08f'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#a1aab2' },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => `${val}` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: title,
              formatter: () => '',
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 767,
        options: {
          chart: { height: 150 },
          legend: { fontSize: '12px' },
        },
      },
    ],
  });

  return (
    <div className="bg-lighterror rounded-lg p-6 relative w-full break-words">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-14 h-10 rounded-full flex items-center justify-center  bg-error text-white">
            <Icon icon="solar:chart-square-bold-duotone" height={24} />
          </span>
          <h5 className="text-base opacity-70">System Health Stats</h5>
        </div>
        <Dropdown
          label=""
          dismissOnClick={false}
          renderTrigger={() => (
            <span className="h-9 w-9 flex justify-center items-center rounded-full cursor-pointer">
              <HiOutlineDotsVertical size={22} />
            </span>
          )}
        >
          {Action.map((item, index) => (
            <Dropdown.Item key={index} className="flex gap-3">
              <Icon icon={item.icon} height={18} />
              <span>{item.listtitle}</span>
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
        <div>
          <h6 className="text-sm font-medium mb-2">Datastore Usage</h6>
          {datastoreUsage.series.length > 0 && datastoreUsage.series.some(val => val > 0) ? (
            <Chart
              options={{ ...chartOptions('MiB'), labels: datastoreUsage.labels }}
              series={datastoreUsage.series}
              type="donut"
              height="200px"
              width="100%"
            />
          ) : (
            <p>No data available</p>
          )}
        </div>
        <div>
          <h6 className="text-sm font-medium mb-2">VM Network Usage</h6>
          {vmNetworkUsage.series.length > 0 ? (
            <Chart
              options={{ ...chartOptions('VMs'), labels: vmNetworkUsage.labels }}
              series={vmNetworkUsage.series}
              type="donut"
              height="200px"
              width="100%"
            />
          ) : (
            <p>No data available</p>
          )}
        </div>
        <div>
          <h6 className="text-sm font-medium mb-2">Maintenance Mode</h6>
          {maintenanceMode.series.length > 0 ? (
            <Chart
              options={{ ...chartOptions('Servers'), labels: maintenanceMode.labels }}
              series={maintenanceMode.series}
              type="donut"
              height="200px"
              width="100%"
            />
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthStats;