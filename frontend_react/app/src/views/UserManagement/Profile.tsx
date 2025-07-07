import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaSave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AxiosError } from 'axios';

// Define User interface based on AuthContext and userModel
interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
  age?: number;
  email?: string;
  phone?: number;
  image_User?: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>({
    _id: '',
    name: '',
    username: '',
    role: '',
    age: undefined,
    email: undefined,
    phone: undefined,
    image_User: undefined,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !user._id) {
        console.log('No user or invalid _id:', user);
        setLoading(false);
        return;
      }
      console.log('Auth user:', user); // Debug: Check initial user object
      try {
        const res = await api.get(`/users/getUserById/${user._id}`);
        console.log('API response:', res.data); // Debug: Check API response
        // Handle potential nested data structure
        const data = res.data.data ? res.data.data : res.data;
        if (data && typeof data === 'object') {
          setFormData({
            _id: data._id || user._id,
            name: data.name || user.name || '',
            username: data.username || user.username || '',
            role: data.role || user.role || '',
            age: data.age,
            email: data.email,
            phone: data.phone,
            image_User: data.image_User,
          });
        } else {
          console.warn('Invalid API response format:', res.data);
          setError('Invalid data received from server');
        }
        setError('');
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        console.error('API error:', axiosError.response?.data || axiosError.message); // Debug: Log error details
        setError(axiosError.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [user, user?._id]);

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!user?._id) throw new Error('User not authenticated');
      const payload = { 
        name: formData.name, 
        username: formData.username, 
        role: formData.role, 
        age: formData.age, 
        email: formData.email, 
        phone: formData.phone 
      };
      console.log('Update payload:', payload); // Debug: Check payload
      const res = await api.put(`/users/updateUser/${user._id}`, payload);
      const data = res.data.data ? res.data.data : res.data;
      if (data && typeof data === 'object') {
        setFormData(data);
      } else {
        throw new Error('Invalid update response');
      }
      setIsEditing(false);
      setError('');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      console.error('Update error:', axiosError.response?.data || axiosError.message); // Debug: Log update error
      setError(axiosError.response?.data?.message || 'Failed to update profile');
    }
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaUser className="mr-2" /> My Profile
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaEdit className="mr-2" /> Edit Profile
            </button>
          )}
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <form key={formData._id} onSubmit={handleUpdateProfile} className="space-y-6"> {/* Force re-render */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                id="username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                id="role"
                value={formData.role}
                disabled
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            {formData.age !== undefined && (
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  id="age"
                  value={formData.age || 0}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                  disabled={!isEditing}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            )}
            {formData.phone !== undefined && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="number"
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: parseInt(e.target.value) || undefined })}
                  disabled={!isEditing}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            )}
            {formData.image_User && (
              <div>
                <label htmlFor="image_User" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <input
                  type="text"
                  id="image_User"
                  value={formData.image_User}
                  disabled={!isEditing}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    _id: user._id,
                    name: user.name || '',
                    username: user.username || '',
                    role: user.role || '',
                    age: user.age,
                    email: user.email,
                    phone: user.phone,
                    
                  });
                  setIsEditing(false);
                  setError('');
                }}
                className="ml-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;