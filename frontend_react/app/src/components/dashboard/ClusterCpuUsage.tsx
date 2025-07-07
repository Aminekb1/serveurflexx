import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import CardBox from '../shared/CardBox';
import axios from 'axios';
import { ApexOptions } from 'apexcharts';

interface ClusterData {
  clusters: string[];
  avgCpuUsage: number[];
  series: { name: string; data: number[] }[];
}

const ClusterCpuUsage = () => {
  const BASE_URL = 'http://localhost:8000';

  const [clusterData, setClusterData] = useState<ClusterData>({
    clusters: [],
    avgCpuUsage: [],
    series: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/stats/cluster-cpu-usage`);
        const data = response.data.data;

        const clusters = data
          .filter((item: any) => item.cluster && typeof item.avg_cpu_usage === 'number')
          .map((item: any) => item.cluster);
        const avgCpuUsage = data
          .filter((item: any) => item.cluster && typeof item.avg_cpu_usage === 'number')
          .map((item: any) => item.avg_cpu_usage);

        const series = [{ name: 'Average CPU Usage', data: avgCpuUsage }];

        setClusterData({ clusters, avgCpuUsage, series });
      } catch (error) {
        console.error('Failed to fetch cluster CPU usage:', error);
        setClusterData({ clusters: [], avgCpuUsage: [], series: [] });
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    series: clusterData.series,
    chart: {
      fontFamily: 'inherit',
      type: 'bar' as const,
      height: 350,
      toolbar: { show: false },
    },
    colors: ['var(--color-primary)'],
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        columnWidth: '30%',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      type: 'category',
      categories: clusterData.clusters,
      labels: {
        style: { colors: '#a1aab2' },
        rotate: -45,
      },
    },
    yaxis: {
      min: 0,
      max: Math.max(...clusterData.avgCpuUsage, 100) * 0.2,
      tickAmount: 4,
      title: {
        text: 'Average CPU Usage (%)',
        style: { color: '#a1aab2' },
      },
      labels: {
        style: { colors: '#a1aab2' },
      },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => `${val.toFixed(1)}%` },
    },
  };

  return (
    <CardBox>
      <div className="flex justify-between items-center">
        <h5 className="card-title">Cluster CPU Usage</h5>
      </div>
      <div>
        {clusterData.clusters.length > 0 && clusterData.avgCpuUsage.length > 0 ? (
          <Chart options={options} series={clusterData.series} type="bar" height="315px" width="100%" />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </CardBox>
  );
};

export default ClusterCpuUsage;