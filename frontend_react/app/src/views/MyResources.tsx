// src/views/Resources/MyResources.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { AxiosError } from 'axios';
import { FaServer, FaTrash } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';

interface Resource {
  _id: string;
  nom: string;
  cpu: number;
  ram: number;
  stockage: number;
  nombreHeure: number;
  allocatedStart: string;
}

interface Order {
  _id: string;
  dateCommande: string;
  ressources: Resource[];
  status: string;
}

const MyResources = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [allocatedResources, setAllocatedResources] = useState<Resource[]>([]);
  const [error, setError] = useState<string>('');
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: number }>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const formatDigitalTimer = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const hours = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard');
        return;
      }

      const fetchOrders = async () => {
        try {
          const res = await api.get('/commandes/getAllCommandees', {
            withCredentials: true,
          });

          console.log("API Response:", res.data);

          const orders: Order[] = res.data;
          // Filter to ensure unique resources by _id
          const uniqueResources = orders
            .flatMap((o) => o.ressources)
            .filter((resource, index, self) =>
              index === self.findIndex((r) => r._id === resource._id)
            );
          setAllocatedResources(uniqueResources);

          const initialRemaining: { [key: string]: number } = {};
          uniqueResources.forEach((r) => {
            const parentOrder = orders.find(order =>
              order.ressources.some(res => res._id === r._id)
            );
            const startDate = r.allocatedStart || parentOrder?.dateCommande;

            if (startDate && r.nombreHeure) {
              const start = new Date(startDate).getTime();
              const end = start + r.nombreHeure * 3600 * 1000;
              initialRemaining[r._id] = Math.max(0, end - Date.now());
            } else {
              initialRemaining[r._id] = 0;
              console.warn(`Resource ${r._id} missing start date or duration`, r);
            }
          });
          setRemainingTimes(initialRemaining);
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          setError(axiosError.response?.data?.message || 'Failed to fetch resources');
        }
      };

      fetchOrders();
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimes((prev) => {
        const newRemaining = { ...prev };
        Object.keys(newRemaining).forEach((key) => {
          if (newRemaining[key] > 0) {
            newRemaining[key] -= 1000;
          }
        });
        return newRemaining;
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
      setAllocatedResources((prev) => prev.filter((r) => r._id !== resourceId));
      setRemainingTimes((prev) => {
        const newRemaining = { ...prev };
        delete newRemaining[resourceId];
        return newRemaining;
      });
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to remove resource from your allocation');
    } finally {
      setDeleting(null);
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
              const remaining = remainingTimes[resource._id] || 0;
              const totalMs = resource.nombreHeure * 3600 * 1000;
              const progress =
                totalMs > 0 ? Math.max(0, Math.min(100, ((totalMs - remaining) / totalMs) * 100)) : 0;

              const isLow = remaining > 0 && remaining < 3600000;

              return (
                <div key={resource._id} className="bg-white p-6 rounded-lg shadow-md relative">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{resource.nom}</h3>
                  <p className="text-gray-700">CPU: {resource.cpu} vCPUs</p>
                  <p className="text-gray-700">RAM: {resource.ram} GB</p>
                  <p className="text-gray-700">Storage: {resource.stockage} GB</p>
                  <p className="text-gray-700">Duration: {resource.nombreHeure} hours</p>

                  <p className="mt-4 text-gray-700">
                    Remaining Time:{' '}
                    <span className={isLow ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {formatDigitalTimer(remaining)}
                    </span>
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isLow ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {isLow && remaining > 0 && (
                    <p className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg">
                      Alert: Your allocation is almost exhausted!
                    </p>
                  )}

                  {remaining <= 0 && (
                    <p className="mt-2 p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                      Allocation expired
                    </p>
                  )}

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
      </div>
    </MainLayout>
  );
};

export default MyResources;