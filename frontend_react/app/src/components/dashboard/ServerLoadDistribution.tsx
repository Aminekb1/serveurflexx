import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import CardBox from '../shared/CardBox';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

const ServerLoadDistribution = () => {
  const BASE_URL = 'http://localhost:8000';
  const [chartData, setChartData] = useState<{ name: string; data: number[] }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/stats/server-load-distribution`);
        const data = response.data.data;

        const allCategories = ['Low (<15%)', 'Medium (15-20%)', 'High (>30%)']; // Catégories fixes pour CPU
        const cpuSeries = [
          { name: 'CPU Low', data: [data.cpu.find((item: any) => item.category === 'Low (<15%)')?.count || 0, 0, 0] },
          { name: 'CPU Medium', data: [0, data.cpu.find((item: any) => item.category === 'Medium (15-20%)')?.count || 0, 0] },
          { name: 'CPU High', data: [0, 0, data.cpu.find((item: any) => item.category === 'High (>30%)')?.count || 0] },
        ];
        const memorySeries = [
          { name: 'Memory Low', data: [data.memory.find((item: any) => item.category === 'Low (<20%)')?.count || 0, 0, 0] },
          { name: 'Memory Medium', data: [0, data.memory.find((item: any) => item.category === 'Medium (20-25%)')?.count || 0, 0] },
          { name: 'Memory High', data: [0, 0, data.memory.find((item: any) => item.category === 'High (>30%)')?.count || 0] },
        ];

        setChartData([...cpuSeries, ...memorySeries]);
        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to fetch server load distribution:', error);
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: { type: 'area', height: 350, stacked: true, toolbar: { show: false } },
    colors: ['#00E396', '#FEB019', '#FF4560', '#008FFB', '#00E396', '#FF4560'], // Couleurs pour CPU Low, Medium, High, Memory Low, Medium, High
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      title: { text: 'Number of Servers' },
      min: 0,
    },
    tooltip: { y: { formatter: (val) => `${val} servers` } },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
    legend: { position: 'top' },
  };

  return (
    <CardBox>
      <h5 className="card-title">Server Load Distribution (CPU & Memory)</h5>
      {chartData.length > 0 ? (
        <Chart options={options} series={chartData} type="area" height="315px" width="100%" />
      ) : (
        <p>No data available</p>
      )}
    </CardBox>
  );
};

export default ServerLoadDistribution;