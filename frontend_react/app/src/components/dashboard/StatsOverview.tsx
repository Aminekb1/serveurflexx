// frontend_react\app\src\components\dashboard\StatsOverview.tsx
import React from 'react';

interface Props {
  data: {
    totalOrders: number;
    totalRevenue: number;
    averageOrder: number;
    paymentRate: number;
    peakPeriod: string;
    growthPeriod: string;
  };
}

const StatsOverview: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold">Total Orders</h4>
        <p className="text-2xl">{data.totalOrders}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold">Total Revenue</h4>
        <p className="text-2xl">TND {data.totalRevenue.toFixed(2)}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold">Average Order Value</h4>
        <p className="text-2xl">TND {data.averageOrder.toFixed(2)}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold">Payment Rate</h4>
        <p className="text-2xl">{data.paymentRate.toFixed(2)}%</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold">Peak Period</h4>
        <p className="text-2xl">{data.peakPeriod}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold">Growth Period</h4>
        <p className="text-2xl">{data.growthPeriod}</p>
      </div>
    </div>
  );
};

export default StatsOverview;