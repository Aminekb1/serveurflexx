import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaServer, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AxiosError } from 'axios';

// Define interfaces
interface Resource {
  _id: string;
  nom: string;
  cpu: number;
  ram: number;
  stockage: number;
}

interface Client {
  _id: string;
  email: string;
  role: string;
  name: string;
}

interface Order {
  _id: string;
  client: Client;
  dateCommande: string;
  ressources: Resource[];
  status: string;
}

interface FormData {
  _id: string;
  dateCommande: string;
  status: string;
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({ _id: '', dateCommande: '', status: 'non traité' });

  useEffect(() => {
    if (user && id) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/commandes/getCommandeById/${id}`);
          console.log('Order Data:', res.data); // Debug
          setOrder(res.data);
          setFormData({ 
            _id: res.data._id, 
            dateCommande: new Date(res.data.dateCommande).toISOString().split('T')[0], 
            status: res.data.status 
          });
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          setError(axiosError.response?.data?.message || 'Failed to fetch order');
        }
      };
      fetchOrder();
    }
  }, [user, id, navigate]);

  const handleUpdateOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log('Updating order:', formData); // Debug
      const res = await api.put(`/commandes/updateCommandeById/${formData._id}`, {
        dateCommande: formData.dateCommande,
        status: formData.status,
      });
      setOrder(res.data);
      setIsEditModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to update order');
    }
  };

  const handleDeleteOrder = async () => {
    try {
      console.log('Deleting order:', id); // Debug
      await api.delete(`/commandes/deleteCommandeById/${id}`);
      navigate('/dashboard/Orders');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to delete order');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  if (!order) {
    return <div className="flex items-center justify-center min-h-screen">Loading order...</div>;
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'accepté': return 'bg-green-100 text-green-700';
      case 'refusé': return 'bg-red-100 text-red-700';
      case 'en traitement': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaServer className="mr-2" /> Order Details
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Order Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2"><strong>Order ID:</strong></p>
            <p className="text-lg text-gray-900">{order._id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2"><strong>Client:</strong></p>
            <p className="text-lg text-gray-900">{order.client.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2"><strong>Date:</strong></p>
            <p className="text-lg text-gray-900">{new Date(order.dateCommande).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2"><strong>Status:</strong></p>
            <p className="text-lg text-gray-900">
              <span
                className={`px-2 py-1 rounded-full text-sm ${getStatusClass(order.status)}`}
              >
                {order.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Resources Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Resources</h3>
        {order.ressources.length === 0 ? (
          <p className="text-gray-600">No resources assigned</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {order.ressources.map((resource: Resource) => (
              <div key={resource._id} className="bg-gray-50 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">{resource.nom}</p>
                <p className="text-md text-gray-900">CPU: {resource.cpu} vCPUs</p>
                <p className="text-md text-gray-900">RAM: {resource.ram} GB</p>
                <p className="text-md text-gray-900">Storage: {resource.stockage} GB</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => {
            setFormData({ _id: order._id, dateCommande: new Date(order.dateCommande).toISOString().split('T')[0], status: order.status });
            setIsEditModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FaEdit className="mr-2" /> Edit
        </button>
        <button
          onClick={() => setIsDeleteConfirmOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
        >
          <FaTrash className="mr-2" /> Delete
        </button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Order</h3>
            <form onSubmit={handleUpdateOrder}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="dateCommande" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    id="dateCommande"
                    value={formData.dateCommande}
                    onChange={(e) => setFormData({ ...formData, dateCommande: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="accepté">Accepté</option>
                    <option value="refusé">Refusé</option>
                    <option value="en traitement">En traitement</option>
                    <option value="non traité">Non traité</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <FaEdit className="mr-2" /> Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this order?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;