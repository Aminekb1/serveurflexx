import { useEffect, useState } from 'react';
import { FaServer } from 'react-icons/fa';
import api from '../../api';
import { AxiosError } from 'axios';

// Define SystemInfo interface
interface SystemInfo {
  hostname: string;
  type: string;
  platform: string;
}

// Define Cpu interface
interface Cpu {
  model: string;
  speed: number;
}

const SystemStats = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [cpus, setCpus] = useState<Cpu[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const [infoRes, cpusRes] = await Promise.all([
          api.get('/os/getInformationFromPc'),
          api.get('/os/cpus'),
        ]);
        setSystemInfo(infoRes.data);
        setCpus(cpusRes.data);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Failed to fetch system stats');
      }
    };
    fetchSystemStats();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaServer className="mr-2" /> System Stats
      </h3>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {systemInfo && (
        <div className="mb-4">
          <p><strong>Hostname:</strong> {systemInfo.hostname}</p>
          <p><strong>OS Type:</strong> {systemInfo.type}</p>
          <p><strong>Platform:</strong> {systemInfo.platform}</p>
        </div>
      )}
      <h4 className="text-lg font-semibold mb-2">CPU Usage</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cpus.length === 0 ? (
          <p className="text-gray-600">No CPU data available</p>
        ) : (
          cpus.map((cpu, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <p><strong>CPU {index}:</strong> {cpu.model}</p>
              <p><strong>Speed:</strong> {cpu.speed} MHz</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SystemStats;