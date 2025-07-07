import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import CardBox from '../shared/CardBox';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

const VmsPerServer = () => {
  const BASE_URL = 'http://localhost:8000';

  // State for chart data
  const [vmData, setVmData] = useState<{
    servers: string[];
    vmCounts: number[];
  }>({
    servers: [],
    vmCounts: [],
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/stats/vms-per-server`);
        const data = response.data.data;

        // Validate and process data
        const servers = data
          .filter((item: any) => item.server && typeof item.vm_count === 'number')
          .map((item: any) => item.server);
        const vmCounts = data
          .filter((item: any) => item.server && typeof item.vm_count === 'number')
          .map((item: any) => item.vm_count);

        setVmData({
          servers,
          vmCounts,
        });
      } catch (error) {
        console.error('Failed to fetch VMs per server:', error);
        setVmData({ servers: [], vmCounts: [] });
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    series: [
      {
        name: 'VM Count',
        data: vmData.vmCounts,
      },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'bar' as const,
      height: 350,
      offsetY: 10,
      offsetX: -18,
      toolbar: {
        show: false,
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      borderColor: 'rgba(0,0,0,.1)',
    },
    colors: ['var(--color-primary)'],
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        columnWidth: '30%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 5,
      colors: ['transparent'],
    },
    xaxis: {
      type: 'category',
      categories: vmData.servers,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      labels: {
        style: {
          colors: '#a1aab2',
        },
        rotate: -45, // Rotate labels for readability if many servers
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#a1aab2',
        },
      },
      min: 0,
      max: Math.max(...vmData.vmCounts, 10) * 0.2, // Dynamic max with padding
      tickAmount: 2,
      title: {
        text: 'Number of VMs',
        style: {
          color: '#a1aab2',
        },
      },
    },
    fill: {
      opacity: 1,
      colors: ['var(--color-primary)'],
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val} VMs`,
      },
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 767,
        options: {
          stroke: {
            show: false,
            width: 5,
            colors: ['transparent'],
          },
          chart: {
            height: 300,
          },
        },
      },
    ],
  };

  return (
    <CardBox>
      <div className="flex justify-between items-center">
        <h5 className="card-title">VMs per Server</h5>
      </div>
      <div>
        {vmData.servers.length > 0 && vmData.vmCounts.length > 0 ? (
          <Chart
            options={options}
            series={options.series}
            type="bar"
            height="315px"
            width="100%"
          />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </CardBox>
  );
};

export default VmsPerServer;