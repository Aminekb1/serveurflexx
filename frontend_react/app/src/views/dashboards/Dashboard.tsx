import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaServer, FaFileInvoice, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
 // Adjust path if needed
import { AxiosError } from 'axios';


// Define interfaces for data types
interface Order {
  _id: string;
  client: string;
  dateCommande: string;
  ressources: { _id: string }[];
  annulerCommande: boolean;
}

interface Invoice {
  _id: string;
  client: string;
  montant: number;
  statutPaiement: string;
}

interface Notification {
  _id: string;
  user: string;
  type: string;
  message: string;
  lu: boolean;
}

interface SystemStats {
  hostname: string;
  type: string;
  platform: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch orders
          const ordersRes = await api.get('/commandes/getAllCommandes');
          setOrders(ordersRes.data);

          // Fetch invoices
          const invoicesRes = await api.get('/factures/getAllFactures');
          setInvoices(invoicesRes.data);

          // Fetch notifications
          const notificationsRes = await api.get('/notifications/getAllNotifications');
          setNotifications(notificationsRes.data);

          // Fetch system stats (for admins)
          if (user.role === 'admin') {
            const statsRes = await api.get('/os/getInformationFromPc');
            setSystemStats(statsRes.data);
          }
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          setError(axiosError.response?.data?.message || 'Failed to fetch data');
        }
      };
      fetchData();
    }
  }, [user]);

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      await api.post(`/factures/${invoiceId}/payer`, { methodePaiement: 'credit_card' });
      setInvoices(invoices.map((inv: Invoice) => 
        inv._id === invoiceId ? { ...inv, statutPaiement: 'payé' } : inv
      ));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Payment failed');
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/markAsRead/${notificationId}`);
      setNotifications(notifications.map((notif: Notification) => 
        notif._id === notificationId ? { ...notif, lu: true } : notif
      ));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.delete(`/commandes/${orderId}`);
      setOrders(orders.filter((order: Order) => order._id !== orderId));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to cancel order');
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
    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Welcome, {user.name}</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* System Stats (Admin Only) */}
        {user.role === 'admin' && systemStats && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">System Stats</h3>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p><strong>Hostname:</strong> {systemStats.hostname}</p>
              <p><strong>OS Type:</strong> {systemStats.type}</p>
              <p><strong>Platform:</strong> {systemStats.platform}</p>
            </div>
          </div>
        )}

        {/* Orders */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaServer className="mr-2" /> Your Orders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders found</p>
            ) : (
              orders.map((order: Order) => (
                <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Date:</strong> {new Date(order.dateCommande).toLocaleDateString()}</p>
                  <p><strong>Resources:</strong> {order.ressources.length}</p>
                  <p><strong>Status:</strong> {order.annulerCommande ? 'Cancelled' : 'Active'}</p>
                  {!order.annulerCommande && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoices */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaFileInvoice className="mr-2" /> Your Invoices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoices.length === 0 ? (
              <p className="text-gray-600">No invoices found</p>
            ) : (
              invoices.map((invoice: Invoice) => (
                <div key={invoice._id} className="bg-white p-6 rounded-lg shadow-md">
                  <p><strong>Invoice ID:</strong> {invoice._id}</p>
                  <p><strong>Amount:</strong> €{invoice.montant}</p>
                  <p><strong>Status:</strong> {invoice.statutPaiement}</p>
                  {invoice.statutPaiement !== 'payé' && (
                    <button
                      onClick={() => handlePayInvoice(invoice._id)}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaBell className="mr-2" /> Notifications
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {notifications.length === 0 ? (
              <p className="text-gray-600">No notifications found</p>
            ) : (
              notifications.map((notif: Notification) => (
                <div key={notif._id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p><strong>{notif.type}</strong>: {notif.message}</p>
                    <p><strong>Status:</strong> {notif.lu ? 'Read' : 'Unread'}</p>
                  </div>
                  {!notif.lu && (
                    <button
                      onClick={() => handleMarkNotificationRead(notif._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    
  );
};

export default Dashboard;