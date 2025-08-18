// frontend_react\app\src\components\dashboard\SystemStats.tsx
import React from 'react';

interface SystemStatsData {
  hostname: string;
  type: string;
  platform: string;
}

interface Props {
  data: SystemStatsData;
}

const SystemStats: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold mb-4">System Stats</h4>
      <p><strong>Hostname:</strong> {data.hostname}</p>
      <p><strong>OS Type:</strong> {data.type}</p>
      <p><strong>Platform:</strong> {data.platform}</p>
    </div>
  );
};

export default SystemStats;