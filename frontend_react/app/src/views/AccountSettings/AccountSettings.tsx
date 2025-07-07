import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AxiosError } from 'axios';


// Define FormData interface
interface FormData {
  name: string;
  age: string;
}

// Define PasswordData interface
interface PasswordData {
  newPassword: string;
  confirmPassword: string;
}

const AccountSettings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    age: user?.age?.toString() || '',
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.put(`/users/updateUser/${user._id}`, {
        name: formData.name,
        age: parseInt(formData.age),
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!user) return;
    try {
      await api.put(`/users/updatePassword/${user._id}`, {
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password updated successfully');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to update password');
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
    
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <FaCog className="mr-2" /> Account Settings
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        {/* Update Profile Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">Update Profile</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="age" className="block text-gray-700 font-semibold mb-2">Age</label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Update Password Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Update Password</h3>
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 font-semibold mb-2">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    
  );
};

export default AccountSettings;