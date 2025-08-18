// frontend_react\app\src\components\dashboard\SystemHealthStats.tsx
import React from 'react';
import Chart from 'react-apexcharts';

interface Props {
  data: {
    totalNotifications: number;
    readRate: number;
    paymentStatus: { [key: string]: number };
  };
}

const SystemHealthStats: React.FC<Props> = ({ data }) => {
  const chartConfig = {
    series: [
      {
        name: 'Payments',
        data: Object.values(data.paymentStatus),
      },
    ],
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
      },
      xaxis: {
        categories: Object.keys(data.paymentStatus),
      },
      title: {
        text: 'Payment Status Distribution',
        align: "left" as "left",
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h4 className="text-lg font-semibold mb-4">System Health Stats</h4>
      <p>Total Notifications: {data.totalNotifications}</p>
      <p>Read Rate: {data.readRate.toFixed(2)}%</p>
      <Chart options={chartConfig.options} series={chartConfig.series} type="bar" height={250} />
    </div>
  );
};

export default SystemHealthStats;