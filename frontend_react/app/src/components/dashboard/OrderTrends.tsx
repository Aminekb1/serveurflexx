// frontend_react/app/src/components/dashboard/OrderTrends.tsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Point {
  month: string;
  count: number;
}

interface Props {
  data: Point[]; // [{ month: '2025-01', count: 5 }, ...]
}

const OrderTrends: React.FC<Props> = ({ data }) => {
  // Sort by month (string YYYY-MM works lexicographically)
  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const labels = sorted.map(d => d.month);
  const values = sorted.map(d => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Orders",
        data: values,
        fill: false,
        tension: 0.3,
        borderWidth: 2
      }
    ]
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Order Trends (per month)" }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default OrderTrends;
