import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import CardBox from '../shared/CardBox';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

const InfrastructureStats = () => {
  const BASE_URL = 'http://localhost:8000';

  // State for chart data
  const [vmPowerState, setVmPowerState] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
  const [serversPerCluster, setServersPerCluster] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
  const [vmOsDistribution, setVmOsDistribution] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // VM Power State
        const powerStateRes = await axios.get(`${BASE_URL}/stats/vm-power-state`);
        const powerStateData = powerStateRes.data.data;
        setVmPowerState({
          labels: powerStateData.map((item: any) => item.power_state || 'Unknown'),
          series: powerStateData.map((item: any) => item.count),
        });

        // Servers per Cluster
        const serversRes = await axios.get(`${BASE_URL}/stats/servers-per-cluster`);
        const serversData = serversRes.data.data;
        setServersPerCluster({
          labels: serversData.map((item: any) => item.cluster || 'Unknown'),
          series: serversData.map((item: any) => item.server_count),
        });

        // VM OS Distribution
        const osRes = await axios.get(`${BASE_URL}/stats/vm-os-distribution`);
        const osData = osRes.data.data;
        setVmOsDistribution({
          labels: osData.map((item: any) => item.os || 'Unknown'),
          series: osData.map((item: any) => item.count),
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
      height: 250,
      fontFamily: 'inherit',
      toolbar: { show: false },
    },
    labels: [],
    colors: ['#fd6c9e','#cca9dd', '#26c4ec', '#6d11d6', '#ad28ed', '#18f08f'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`, // Removed unused 'opts' parameter
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
          chart: { height: 200 },
          legend: { fontSize: '12px' },
        },
      },
    ],
  });

  return (
    <CardBox>
      <h5 className="card-title">Infrastructure Statistics</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h6 className="text-sm font-medium mb-2">VM Power State</h6>
          {vmPowerState.series.length > 0 ? (
            <Chart
              options={{ ...chartOptions('VMs'), labels: vmPowerState.labels }}
              series={vmPowerState.series}
              type="donut"
              height="250px"
              width="100%"
            />
          ) : (
            <p>No data available</p>
          )}
        </div>
        <div>
          <h6 className="text-sm font-medium mb-2">Servers per Cluster</h6>
          {serversPerCluster.series.length > 0 ? (
            <Chart
              options={{ ...chartOptions('Servers'), labels: serversPerCluster.labels }}
              series={serversPerCluster.series}
              type="donut"
              height="250px"
              width="100%"
            />
          ) : (
            <p>No data available</p>
          )}
        </div>
        <div>
          <h6 className="text-sm font-medium mb-2">VM OS Distribution</h6>
          {vmOsDistribution.series.length > 0 ? (
            <Chart
              options={{ ...chartOptions('VMs'), labels: vmOsDistribution.labels }}
              series={vmOsDistribution.series}
              type="donut"
              height="250px"
              width="100%"
            />
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </CardBox>
  );
};

export default InfrastructureStats;