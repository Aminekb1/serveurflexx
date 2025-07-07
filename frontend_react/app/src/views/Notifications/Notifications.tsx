import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AxiosError } from 'axios';


// Define Notification interface
interface Notification {
  _id: string;
  user: string;
  type: string;
  message: string;
  lu: boolean;
}

const Notifications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications/getAllNotifications');
          setNotifications(res.data);
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          setError(axiosError.response?.data?.message || 'Failed to fetch notifications');
        }
      };
      fetchNotifications();
    }
  }, [user]);

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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
   
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <FaBell className="mr-2" /> My Notifications
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
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
   
  );
};

export default Notifications;