// frontend_react\app\src\components\dashboard\SalesProfit.tsx
import React from 'react';
import Chart from 'react-apexcharts';

interface Props {
  data: { name: string; value: number }[];
}

const SalesProfit: React.FC<Props> = ({ data }) => {
  // Handle empty or invalid data
  const chartData = data.length > 0 ? data : [{ name: 'No Data', value: 0 }];

  const chartConfig = {
    series: [
      {
        name: 'Orders',
        data: chartData.map(item => item.value),
      },
    ],
    options: {
      chart: {
        type: 'line' as const,
        height: 350,
        toolbar: {
          show: true, // Enable toolbar for zooming/panning
        },
      },
      xaxis: {
        categories: chartData.map(item => item.name),
        title: {
          text: 'Month',
        },
      },
      yaxis: {
        title: {
          text: 'Number of Orders',
        },
        min: 0, // Ensure y-axis starts at 0
      },
      title: {
        text: 'Orders Over Time',
        align: 'left' as const,
      },
      tooltip: {
        enabled: true, // Enable tooltips for better UX
        y: {
          formatter: (value: number) => `${value} orders`, // Explicitly type 'value' as number
        },
      },
      noData: {
        text: 'No data available',
        align: 'center' as const, // Use 'center' as a literal type
        verticalAlign: 'middle' as const,
        style: {
          color: '#000000',
          fontSize: '14px',
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Chart options={chartConfig.options} series={chartConfig.series} type="line" height={350} />
    </div>
  );
};

export default SalesProfit;