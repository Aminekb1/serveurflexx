import { useEffect, useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AxiosError } from 'axios';
import { FaSearch, FaServer } from 'react-icons/fa';

// Define Client interface
interface Client {
  _id: string;
  email: string;
  role: string;
  profile?: {
    firstName: string;
    lastName: string;
  };
  name?: string;
}

// Define Order interface
interface Order {
  _id: string;
  client: Client | null;
  dateCommande: string;
  ressources: { _id: string; nom?: string; cpu?: string; ram?: string; stockage?: string; nombreHeure?: number; disponibilite?: boolean; statut?: string; typeRessource?: string }[];
  annulerCommande: boolean;
}

// Define FormData interface for editing
interface FormData {
  _id: string;
  dateCommande: string;
  annulerCommande: boolean;
}

const Orders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Order | ''>('dateCommande');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ _id: '', dateCommande: '', annulerCommande: false });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      console.log('User:', user);
      const fetchOrders = async () => {
        try {
          const res = await api.get('/commandes/getAllCommandes', {
            headers: { 'Cache-Control': 'no-cache' },
          });
          console.log('API Response:', res.data);
          let filteredOrders = res.data;

          // Apply search filter
          if (searchQuery) {
            filteredOrders = filteredOrders.filter((order: Order) =>
              order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (order.client?.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
              (order.client?.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
              (order.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
            );
          }

          // Apply sorting
          filteredOrders.sort((a: Order, b: Order) => {
            const aValue = a[sortField as keyof Order];
            const bValue = b[sortField as keyof Order];
            if (sortField === 'dateCommande') {
              return sortOrder === 'asc' ? new Date(a.dateCommande).getTime() - new Date(b.dateCommande).getTime() : new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime();
            }
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            return 0;
          });

          setOrders(filteredOrders);
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          setError(axiosError.response?.data?.message || 'Failed to fetch orders');
          console.error('API Error:', axiosError.response);
        }
      };
      fetchOrders();
    }
  }, [user, searchQuery, sortField, sortOrder]);

  const handleUpdateOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log('Updating order:', formData);
      const res = await api.put(`/commandes/updateCommandeById/${formData._id}`, {
        dateCommande: formData.dateCommande,
        annulerCommande: formData.annulerCommande,
      });
      setOrders(orders.map((order) => (order._id === formData._id ? res.data : order)));
      setIsEditModalOpen(false);
      setFormData({ _id: '', dateCommande: '', annulerCommande: false });
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to update order');
    }
  };

  const handleEditOrder = (order: Order) => {
    if (order.client) {
      setFormData({
        _id: order._id,
        dateCommande: order.dateCommande,
        annulerCommande: order.annulerCommande,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      console.log('Deleting order:', orderId);
      await api.delete(`/commandes/deleteCommandeById/${orderId}`);
      setOrders(orders.filter((order) => order._id !== orderId));
      setIsDeleteConfirmOpen(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleViewOrder = (orderId: string) => {
    console.log('Navigating to view order:', orderId);
    navigate(`/dashboard/orders/${orderId}`);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaServer className="mr-2" /> Orders
          </h2>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as keyof Order)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="dateCommande">Date</option>
              <option value="_id">Order ID</option>
              <option value="client.profile.firstName">Client</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Order List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.client?.profile?.firstName || order.client?.name || 'Unknown'} {order.client?.profile?.lastName || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.dateCommande).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.ressources.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.annulerCommande ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {order.annulerCommande ? 'Cancelled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
                        >
                          <Edit size={16} />
                        </button>
                        {!order.annulerCommande && (
                          <button
                            onClick={() => setIsDeleteConfirmOpen(order._id)}
                            className="text-red-600 hover:text-red-800 px-2 py-1 rounded bg-red-100 hover:bg-red-200"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-4 flex justify-between items-center">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-4 py-2 ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-lg hover:bg-gray-300`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
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
                  <label htmlFor="annulerCommande" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="annulerCommande"
                    value={formData.annulerCommande ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, annulerCommande: e.target.value === 'true' })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="false">Active</option>
                    <option value="true">Cancelled</option>
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
                  <Edit className="mr-2" size={16} /> Update
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
                onClick={() => setIsDeleteConfirmOpen(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(isDeleteConfirmOpen)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <Trash className="mr-2" size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;