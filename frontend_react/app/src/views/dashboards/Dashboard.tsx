// frontend_react\app\src\views\dashboards\Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AxiosError } from 'axios';

// Import template components (adjust paths if needed)
import StatsOverview from '../../components/dashboard/StatsOverview';
import PopularProducts from '../../components/dashboard/PopularProducts';
import SalesProfit from '../../components/dashboard/SalesProfit';
import SystemStats from '../../components/dashboard/SystemStats';
import InfrastructureStats from '../../components/dashboard/InfrastructureStats';

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

interface SystemStatsData {
  hostname: string;
  type: string;
  platform: string;
}

interface CommandeStats {
  totalCommandes: number;
  totalMontant: number;
  montantMoyen: number;
  commandesParMois: { [key: string]: number };
  peakMonth: string;
  growthPeriod: string;
  mostConsumed: { name: string; count: number }[];
}

interface FactureStats {
  totalFactures: number;
  totalMontant: number;
  totalPaye: number;
  tauxPaiement: number;
  parStatut: { [key: string]: number };
}

interface NotificationStats {
  totalNotifications: number;
  tauxLu: number;
  parType: { [key: string]: number };
}

interface RessourceStats {
  totalRessources: number;
  tauxDisponibilite: number;
  parType: { [key: string]: number };
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [, setOrders] = useState<Order[]>([]);
  const [, setInvoices] = useState<Invoice[]>([]);
  const [, setNotifications] = useState<Notification[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStatsData | null>(null);
  const [commandeStats, setCommandeStats] = useState<CommandeStats | null>(null);
  const [factureStats, setFactureStats] = useState<FactureStats | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [ressourceStats, setRessourceStats] = useState<RessourceStats | null>(null);
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

          // Fetch dashboard stats
          const commandeStatsRes = await api.get('/stats/commandes');
          setCommandeStats(commandeStatsRes.data);

          const factureStatsRes = await api.get('/stats/factures');
          setFactureStats(factureStatsRes.data);

          const notificationStatsRes = await api.get('/stats/notifications');
          setNotificationStats(notificationStatsRes.data);

          const ressourceStatsRes = await api.get('/stats/ressources');
          setRessourceStats(ressourceStatsRes.data);
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          setError(axiosError.response?.data?.message || 'Failed to fetch data');
        }
      };
      fetchData();
    }
  }, [user]);




  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Welcome</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Analytics Dashboard Section using Template Components */}
      {commandeStats && factureStats && notificationStats && ressourceStats && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Analytics Overview</h3>
          {/* Use StatsOverview for key metrics */}
          <StatsOverview 
            data={{
              totalOrders: commandeStats.totalCommandes,
              totalRevenue: commandeStats.totalMontant,
              averageOrder: commandeStats.montantMoyen,
              paymentRate: factureStats.tauxPaiement,
              peakPeriod: commandeStats.peakMonth,
              growthPeriod: commandeStats.growthPeriod,
            }} 
          />

          {/* Sales/Orders Profit/Trends Chart */}
          <SalesProfit 
            data={Object.entries(commandeStats.commandesParMois).map(([month, count]) => ({ name: month, value: count }))} 
          />

          {/* Popular Products (Most Consumed Resources) */}
          <PopularProducts 
            products={commandeStats.mostConsumed.map(({ name, count }) => ({ name, sales: count }))} 
          />

          {/* System Stats */}
          {user.role === 'admin' && systemStats && (
            <SystemStats data={systemStats} />
          )}

          {/* Infrastructure/Resource Stats */}
          <InfrastructureStats 
            data={{
              totalResources: ressourceStats.totalRessources,
              availability: ressourceStats.tauxDisponibilite,
            }} 
          />

        </div>
      )}

      
    </div>
  );
};

export default Dashboard;