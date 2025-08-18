// frontend_react\app\src\components\dashboard\ResourceChart.tsx
import React from 'react';
import Chart from 'react-apexcharts';

interface Props {
  data: { label: string; value: number }[];
}

const ResourceChart: React.FC<Props> = ({ data }) => {
  const chartConfig = {
    series: data.map(item => item.value),
    options: {
      chart: {
        type: "pie" as "pie",
        height: 350,
      },
      labels: data.map(item => item.label),
      title: {
        text: 'Resource Distribution',
        align: "left" as "left",
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <Chart options={chartConfig.options} series={chartConfig.series} type="pie" height={250} />
    </div>
  );
};

export default ResourceChart;