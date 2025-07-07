import { useEffect, useState } from 'react';
import { FaChartPie } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../../api';
import { AxiosError } from 'axios';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define Stats interface
interface Stats {
  parType: { [key: string]: number }; // e.g., { "cpu": 10, "memory": 20 }
}

const ResourceChart = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/ressources');
        setStats(res.data);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return null;
  }

  // Chart.js data configuration
  const chartData = {
    labels: Object.keys(stats.parType),
    datasets: [
      {
        data: Object.values(stats.parType),
        backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  // Chart.js options configuration
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Resources by Type',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaChartPie className="mr-2" /> Resource Distribution
      </h3>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default ResourceChart;