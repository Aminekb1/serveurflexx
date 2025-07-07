import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import CardBox from '../shared/CardBox';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

// Custom type for series to replace ApexAxisChartSeries
interface SeriesType {
  name: string;
  data: number[];
}

const ServerCpuUsage = () => {
  const BASE_URL = 'http://localhost:8000';

  // State for chart data
  const [cpuData, setCpuData] = useState<{
    servers: string[];
    currentUsage: number[];
    //previousUsage: number[];
    series: SeriesType[];
  }>({
    servers: [],
    currentUsage: [],
  //  previousUsage: [],
    series: [],
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/stats/server-cpu-usage`);
        const data = response.data.data;

        // Validate and process data
        const servers = data
          .filter((item: any) => item.server && typeof item.cpu_usage === 'string')
          .map((item: any) => item.server);
        const currentUsage = data
          .filter((item: any) => item.server && typeof item.cpu_usage === 'string')
          .map((item: any) => {
            // Parse percentage string (e.g., "10%" → 10)
            const value = parseFloat(item.cpu_usage.replace('%', ''));
            return isNaN(value) ? 0 : value;
          });

        // Simulate previous usage (optional, remove if not needed)
        /* const previousUsage = currentUsage.map((usage: number) =>
          Math.max(0, usage * (0.8 + Math.random() * 0.4)) // Random variation ±20%
        ); */

        // Compute series based on available data
        const series: SeriesType[] = [
          {
            name: 'Current Period',
            data: currentUsage,
          },
        ];
        /* if (previousUsage.length > 0) {
          series.push({
            name: 'Previous Period',
            data: previousUsage,
          });
        } */

        setCpuData({
          servers,
          currentUsage,
         // previousUsage,
          series,
        });
      } catch (error) {
        console.error('Failed to fetch CPU usage:', error);
        setCpuData({ servers: [], currentUsage: [], series: [] });
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    series: cpuData.series, // Reference series from state
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
    colors: ['var(--color-primary)', 'var(--color-secondary)'],
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
      categories: cpuData.servers,
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
      max: Math.max(...cpuData.currentUsage, 100) * 0.15, // Dynamic max with padding
      tickAmount: 4,
      title: {
        text: 'CPU Usage (%)',
        style: {
          color: '#a1aab2',
        },
      },
    },
    fill: {
      opacity: 1,
      colors: ['var(--color-primary)', 'var(--color-secondary)'],
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#a1aab2',
      },
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
        <h5 className="card-title">Server CPU Usage</h5>
      </div>
      <div>
        {cpuData.servers.length > 0 && cpuData.currentUsage.length > 0 ? (
          <Chart
            options={options}
            series={cpuData.series}
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

export default ServerCpuUsage;