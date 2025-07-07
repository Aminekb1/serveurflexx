import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import CardBox from '../shared/CardBox';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

const ClusterCpuDistribution = () => {
  const BASE_URL = 'http://localhost:8000';
  const [chartData, setChartData] = useState<{ name: string; data: number[] }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/stats/cluster-cpu-distribution`);
        const data = response.data.data;

        const allClusters = Object.keys(data);
        setCategories(['Low (<15%)', 'Medium (15-20%)', 'High (>30%)']); // Catégories fixes

        const series = allClusters.map(cluster => {
          const counts = ['Low (<15%)', 'Medium (15-20%)', 'High (>30%)'].map(cat =>
            data[cluster]["counts"][data[cluster]["categories"].indexOf(cat)] || 0
          );
          return { name: cluster, data: counts };
        });

        setChartData(series);
      } catch (error) {
        console.error('Failed to fetch cluster CPU distribution:', error);
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: { type: 'area', height: 350, stacked: true, toolbar: { show: false } },
    colors: ['#26c4ec', '#fe6219', '#FF4560'], // Couleurs pour Low, Medium, High
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
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9 } }, // Gradient effect
    legend: { position: 'top' },
  };

  return (
    <CardBox>
      <h5 className="card-title">Cluster CPU Usage Distribution</h5>
      {chartData.length > 0 ? (
        <Chart options={options} series={chartData} type="area" height="315px" width="100%" />
      ) : (
        <p>No data available</p>
      )}
    </CardBox>
  );
};

export default ClusterCpuDistribution;