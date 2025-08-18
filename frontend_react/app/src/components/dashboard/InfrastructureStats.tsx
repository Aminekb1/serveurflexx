// frontend_react\app\src\components\dashboard\InfrastructureStats.tsx
import React from 'react';

interface Props {
  data: {
    totalResources: number;
    availability: number;
  };
}

const InfrastructureStats: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold">Total Resources</h4>
        <p className="text-2xl">{data.totalResources}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold">Availability Rate</h4>
        <p className="text-2xl">{data.availability.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default InfrastructureStats;