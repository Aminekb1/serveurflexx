// frontend_react/app/src/views/MyResources.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { AxiosError } from 'axios';
import { FaServer, FaTrash, FaPlug, FaDesktop } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';

interface Resource {
  _id: string;
  nom: string;
  cpu: number;
  ram: number;
  stockage: number;
  nombreHeure: number;
  allocatedStart?: string | null;
  os: 'ubuntu' | 'windows' | 'linux' | 'macOs' | 'CentOs';
  connectionDetails?: {
    ipAddress: string;
    username: string;
    password: string;
    protocol: 'ssh' | 'rdp';
    instructions?: string;
  };
}

interface Order {
  _id: string;
  dateCommande: string;
  ressources: Resource[];
  status: string;
}

interface ConnectionDetails {
  ipAddress: string;
  username: string;
  password: string;
  protocol: 'ssh' | 'rdp';
  instructions: string;
}

const MyResources = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [allocatedResources, setAllocatedResources] = useState<Resource[]>([]);
  const [connectionDetails, setConnectionDetails] = useState<{ [key: string]: ConnectionDetails }>({});
  const [consoleUrls, setConsoleUrls] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string>('');
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: number }>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const formatDigitalTimer = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const hours = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/commandes/getAllCommandees', {
          withCredentials: true,
        });

        const orders: Order[] = res.data;
        // resources unique
        const uniqueResources = orders
          .flatMap((o) => o.ressources)
          .filter((resource, index, self) =>
            index === self.findIndex((r) => r._id === resource._id)
          );

        setAllocatedResources(uniqueResources);

        // compute remaining times based on allocatedStart OR dateCommande (server is source of truth)
        const initialRemaining: { [key: string]: number } = {};
        uniqueResources.forEach((r) => {
          const parentOrder = orders
  .filter(o => o.ressources.some(rsc => rsc._id === r._id))
  .sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime())[0];

          // Ne PAS créer or modifier allocatedStart côté client.
          // Utiliser d'abord allocatedStart (si présent dans la ressource en DB), sinon fallback sur dateCommande.
         const startDateString = (r.allocatedStart && r.allocatedStart !== 'null')
  ? r.allocatedStart
  : (parentOrder && (parentOrder.status === 'accepté' || parentOrder.status === 'en traitement') ? parentOrder.dateCommande : null);
          if (startDateString && r.nombreHeure) {
            const start = new Date(startDateString).getTime();
            if (!isNaN(start)) {
              const end = start + r.nombreHeure * 3600 * 1000;
              initialRemaining[r._id] = Math.max(0, end - Date.now());
            } else {
              console.warn(`Invalid start date for resource ${r._id}:`, startDateString);
              initialRemaining[r._id] = 0;
            }
          } else {
            // Pas de date connue => afficher 0 (ou "en attente")
            initialRemaining[r._id] = 0;
          }
        });

        setRemainingTimes(initialRemaining);

        // Fetch connection details in parallel (best-effort)
        const connectionPromises = uniqueResources.map(async (resource) => {
          try {
            const r = await api.get(`/ressource/${resource._id}/connection`, { withCredentials: true });
            return { id: resource._id, details: r.data.connectionDetails };
          } catch (err) {
            return { id: resource._id, details: null };
          }
        });

        // Fetch console URLs in parallel (best-effort)
        const consolePromises = uniqueResources.map(async (resource) => {
          try {
            const r = await api.post(`/ressource/${resource._id}/console`, {}, { withCredentials: true });
            return { id: resource._id, consoleUrl: r.data.consoleUrl };
          } catch (err) {
            return { id: resource._id, consoleUrl: null };
          }
        });

        const connectionResults = await Promise.all(connectionPromises);
        const connectionDetailsMap = connectionResults.reduce((acc, { id, details }) => {
          if (details) acc[id] = details;
          return acc;
        }, {} as { [key: string]: ConnectionDetails });
        setConnectionDetails(connectionDetailsMap);

        const consoleResults = await Promise.all(consolePromises);
        const consoleUrlsMap = consoleResults.reduce((acc, { id, consoleUrl }) => {
          if (consoleUrl) acc[id] = consoleUrl;
          return acc;
        }, {} as { [key: string]: string });
        setConsoleUrls(consoleUrlsMap);

        setError('');
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError?.response?.data?.message || 'Failed to fetch resources');
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // single timer that decrements remainingTimes by 1000 ms every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimes(prev => {
        const next: { [key: string]: number } = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] > 0) next[k] = Math.max(0, next[k] - 1000);
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to remove this resource from your allocation? This action cannot be undone.')) {
      return;
    }
    setDeleting(resourceId);
    setError('');
    try {
      await api.delete(`/ressource/removeResourceFromClient/${resourceId}`, { withCredentials: true });
      setAllocatedResources(prev => prev.filter(r => r._id !== resourceId));
      setRemainingTimes(prev => {
        const copy = { ...prev };
        delete copy[resourceId];
        return copy;
      });
      setConnectionDetails(prev => {
        const copy = { ...prev };
        delete copy[resourceId];
        return copy;
      });
      setConsoleUrls(prev => {
        const copy = { ...prev };
        delete copy[resourceId];
        return copy;
      });
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError?.response?.data?.message || 'Failed to remove resource from your allocation');
    } finally {
      setDeleting(null);
    }
  };

  const handleShowConnectionDetails = (resourceId: string) => {
    setSelectedResourceId(resourceId);
  };

  const handleLaunchConsole = async (resourceId: string) => {
    try {
      const res = await api.post(`/ressource/${resourceId}/console`, {}, { withCredentials: true });
      if (res.data?.consoleUrl) window.open(res.data.consoleUrl, '_blank');
      else alert('No console URL available');
    } catch (err) {
      console.error(err);
      alert('Failed to launch web console. See console for details.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaServer className="mr-2" /> My Allocated Resources
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {allocatedResources.length === 0 ? (
          <p className="text-gray-600">No allocated resources yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allocatedResources.map((resource) => {
              const remaining = remainingTimes[resource._id] ?? 0;
              const totalMs = resource.nombreHeure * 3600 * 1000;
              const progress = totalMs > 0 ? Math.max(0, Math.min(100, ((totalMs - remaining) / totalMs) * 100)) : 0;
              const isLow = remaining > 0 && remaining < 3600000;
              const connection = connectionDetails[resource._id];

              return (
                <div key={resource._id} className="bg-white p-6 rounded-lg shadow-md relative">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{resource.nom}</h3>
                  <p className="text-gray-700">CPU: {resource.cpu} vCPUs</p>
                  <p className="text-gray-700">RAM: {resource.ram} GB</p>
                  <p className="text-gray-700">Storage: {resource.stockage} GB</p>
                  <p className="text-gray-700">OS: {resource.os}</p>
                  <p className="text-gray-700">Duration: {resource.nombreHeure} hours</p>

                  <p className="mt-4 text-gray-700">
                    Remaining Time:{' '}
                    <span className={isLow ? 'text-red-600 font-bold' : (remaining > 0 ? 'text-green-600' : 'text-gray-500')}>
                      {formatDigitalTimer(remaining)}
                    </span>
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {isLow && remaining > 0 && (
                    <p className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg">Alert: Your allocation is almost exhausted!</p>
                  )}
                  {remaining <= 0 && (
                    <p className="mt-2 p-2 bg-yellow-100 text-yellow-700 rounded-lg">Allocation expired</p>
                  )}

                  <button
                    onClick={() => handleShowConnectionDetails(resource._id)}
                    className="mt-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    disabled={!connection || remaining <= 0}
                  >
                    <FaPlug className="mr-1" /> Connect to VM
                  </button>

                  <button
                    onClick={() => handleDeleteResource(resource._id)}
                    disabled={deleting === resource._id}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedResourceId && connectionDetails[selectedResourceId] && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Connection Details for {allocatedResources.find(r => r._id === selectedResourceId)?.nom}
                </h3>
                <button onClick={() => setSelectedResourceId(null)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>
              <div className="space-y-4">
                <p><strong>IP Address:</strong> {connectionDetails[selectedResourceId].ipAddress}</p>
                <p><strong>Username:</strong> {connectionDetails[selectedResourceId].username}</p>
                <p><strong>Password:</strong> {connectionDetails[selectedResourceId].password}</p>
                <p><strong>Protocol:</strong> {connectionDetails[selectedResourceId].protocol.toUpperCase()}</p>
                <p><strong>Instructions:</strong> {connectionDetails[selectedResourceId].instructions}</p>

                {connectionDetails[selectedResourceId].protocol === 'ssh' && (
                  <p>
                    <strong>Command:</strong>
                    <code className="block bg-gray-100 p-2 rounded mt-2">
                      ssh {connectionDetails[selectedResourceId].username}@{connectionDetails[selectedResourceId].ipAddress}
                    </code>
                  </p>
                )}

                {connectionDetails[selectedResourceId].protocol === 'rdp' && (
                  <p>
                    <strong>Steps:</strong>
                    <ol className="list-decimal list-inside mt-2">
                      <li>Open Remote Desktop Connection (mstsc) on Windows or a compatible RDP client.</li>
                      <li>Enter the IP address: {connectionDetails[selectedResourceId].ipAddress}</li>
                      <li>Use the username: {connectionDetails[selectedResourceId].username}</li>
                      <li>Use the password: {connectionDetails[selectedResourceId].password}</li>
                    </ol>
                  </p>
                )}

                <button
                  onClick={() => handleLaunchConsole(selectedResourceId)}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                  disabled={!consoleUrls[selectedResourceId] || (remainingTimes[selectedResourceId] ?? 0) <= 0}
                >
                  <FaDesktop className="mr-2" /> Launch Web Console
                </button>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setSelectedResourceId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyResources;
