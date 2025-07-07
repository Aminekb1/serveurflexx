import { useEffect, useState } from 'react';
import { FaChartBar } from 'react-icons/fa';
import api from '../../api';
import { AxiosError } from 'axios';

// Define interfaces for stats data
interface CommandesStats {
  totalCommandes: number;
  montantMoyen: number;
}

interface FacturesStats {
  totalFactures: number;
  tauxPaiement: number;
}

interface NotificationsStats {
  totalNotifications: number;
  tauxLu: number;
}

interface RessourcesStats {
  totalRessources: number;
  tauxDisponibilite: number;
}

interface Stats {
  commandes: CommandesStats | null;
  factures: FacturesStats | null;
  notifications: NotificationsStats | null;
  ressources: RessourcesStats | null;
}

const StatsOverview = () => {
  const [stats, setStats] = useState<Stats>({
    commandes: null,
    factures: null,
    notifications: null,
    ressources: null,
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [commandesRes, facturesRes, notificationsRes, ressourcesRes] = await Promise.all([
          api.get('/stats/commandes'),
          api.get('/stats/factures'),
          api.get('/stats/notifications'),
          api.get('/stats/ressources'),
        ]);
        setStats({
          commandes: commandesRes.data,
          factures: facturesRes.data,
          notifications: notificationsRes.data,
          ressources: ressourcesRes.data,
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaChartBar className="mr-2" /> Stats Overview
      </h3>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.commandes && (
          <div className="p-4 border rounded-lg">
            <p><strong>Total Orders:</strong> {stats.commandes.totalCommandes}</p>
            <p><strong>Avg Amount:</strong> €{stats.commandes.montantMoyen.toFixed(2)}</p>
          </div>
        )}
        {stats.factures && (
          <div className="p-4 border rounded-lg">
            <p><strong>Total Invoices:</strong> {stats.factures.totalFactures}</p>
            <p><strong>Payment Rate:</strong> {stats.factures.tauxPaiement.toFixed(2)}%</p>
          </div>
        )}
        {stats.notifications && (
          <div className="p-4 border rounded-lg">
            <p><strong>Total Notifications:</strong> {stats.notifications.totalNotifications}</p>
            <p><strong>Read Rate:</strong> {stats.notifications.tauxLu.toFixed(2)}%</p>
          </div>
        )}
        {stats.ressources && (
          <div className="p-4 border rounded-lg">
            <p><strong>Total Resources:</strong> {stats.ressources.totalRessources}</p>
            <p><strong>Availability Rate:</strong> {stats.ressources.tauxDisponibilite.toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsOverview;