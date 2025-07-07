import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaServer, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define Resource interface
interface Resource {
  _id: string;
  id: string;
  nom: string;
  typeRessource: 'server' | 'vm';
  cpu: number;
  ram: number;
  stockage: number;
  nombreHeure: number;
  disponibilite: boolean;
  statut: 'Active' | 'Inactive';
  image?: string;
}

// Define FormData interface
interface FormData {
  id: string;
  nom: string;
  cpu: string;
  typeRessource: 'server' | 'vm';
  ram: string;
  stockage: string;
  nombreHeure: string;
  disponibilite: boolean;
  statut: 'Active' | 'Inactive';
  image?: string;
}

const Resources = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    id: uuidv4(),
    nom: '',
    cpu: '',
    typeRessource: 'vm',
    ram: '',
    stockage: '',
    nombreHeure: '',
    disponibilite: true,
    statut: 'Active',
    image: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    console.log('Resources useEffect - User:', user, 'Loading:', loading);
    if (loading) {
      console.log('Still loading, skipping role check');
      return;
    }
   
    const fetchResources = async () => {
      try {
        const res = await api.get('/ressource/getAllRessources');
        setResources(res.data);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Failed to fetch resources');
      }
    };
    fetchResources();
  }, [user, loading, navigate]);

  const handleAddOrUpdateResource = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cpu: parseInt(formData.cpu),
        ram: parseInt(formData.ram),
        stockage: parseInt(formData.stockage),
        nombreHeure: parseInt(formData.nombreHeure),
        image: formData.image || undefined, // Send only if provided
      };

      if (isEditing) {
        const res = await api.put(`/ressource/updateRessource/${formData.id}`, payload);
        setResources(resources.map((r) => (r._id === formData.id ? res.data : r)));
      } else {
        const res = await api.post('/ressource/addRessource', payload);
        setResources([...resources, res.data]);
      }

      setFormData({
        id: uuidv4(),
        nom: '',
        cpu: '',
        typeRessource: 'vm',
        ram: '',
        stockage: '',
        nombreHeure: '',
        disponibilite: true,
        statut: 'Active',
        image: '',
      });
      setIsEditing(false);
      setIsModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      console.log('API Error:', axiosError.response?.data);
      setError(axiosError.response?.data?.message || 'Failed to save resource');
    }
  };

  const handleEditResource = (resource: Resource) => {
    setFormData({
      id: resource._id,
      nom: resource.nom,
      cpu: resource.cpu.toString(),
      typeRessource: resource.typeRessource,
      ram: resource.ram.toString(),
      stockage: resource.stockage.toString(),
      nombreHeure: resource.nombreHeure.toString(),
      disponibilite: resource.disponibilite,
      statut: resource.statut,
      image: resource.image || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await api.delete(`/ressource/deleteRessourceById/${resourceId}`);
      setResources(resources.filter((res) => res._id !== resourceId));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to delete resource');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.typeRessource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResources = filteredResources.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  const openModal = () => {
    setFormData({
      id: uuidv4(),
      nom: '',
      cpu: '',
      typeRessource: 'vm',
      ram: '',
      stockage: '',
      nombreHeure: '',
      disponibilite: true,
      statut: 'Active',
      image: '',
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaServer className="mr-2" /> Resources
          </h2>
          <div className="flex gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={openModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaPlus className="mr-2" /> Add Resource
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      {/* Resource Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentResources.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">No resources found</div>
        ) : (
          currentResources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="h-32 bg-gray-200 flex items-center justify-center mb-4 relative">
                  {resource.image ? (
                    <img src={resource.image} alt={resource.nom} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-500">Image</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.nom}</h3>
                <p className="text-sm text-gray-600 mb-2">Type: {resource.typeRessource}</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>CPU: {resource.cpu} vCPUs</li>
                  <li>RAM: {resource.ram} GB</li>
                  <li>Storage: {resource.stockage} GB</li>
                  <li>Hours: {resource.nombreHeure}</li>
                </ul>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${resource.disponibilite ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {resource.disponibilite ? 'Available' : 'Unavailable'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${resource.statut === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {resource.statut}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditResource(resource)}
                    className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteResource(resource._id)}
                    className="text-red-600 hover:text-red-800 px-2 py-1 rounded bg-red-100 hover:bg-red-200"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredResources.length > itemsPerPage && (
        <div className="mt-8 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border border-gray-300 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {isEditing ? 'Update Resource' : 'Add New Resource'}
            </h3>
            <form onSubmit={handleAddOrUpdateResource}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                    ID
                  </label>
                  <input
                    type="text"
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cpu" className="block text-sm font-medium text-gray-700 mb-1">
                    CPU (vCPUs)
                  </label>
                  <input
                    type="number"
                    id="cpu"
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="typeRessource" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="typeRessource"
                    value={formData.typeRessource}
                    onChange={(e) => setFormData({ ...formData, typeRessource: e.target.value as 'server' | 'vm' })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="vm">VM</option>
                    <option value="server">Server</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ram" className="block text-sm font-medium text-gray-700 mb-1">
                    RAM (GB)
                  </label>
                  <input
                    type="number"
                    id="ram"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="stockage" className="block text-sm font-medium text-gray-700 mb-1">
                    Storage (GB)
                  </label>
                  <input
                    type="number"
                    id="stockage"
                    value={formData.stockage}
                    onChange={(e) => setFormData({ ...formData, stockage: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="nombreHeure" className="block text-sm font-medium text-gray-700 mb-1">
                    Hours
                  </label>
                  <input
                    type="number"
                    id="nombreHeure"
                    value={formData.nombreHeure}
                    onChange={(e) => setFormData({ ...formData, nombreHeure: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="statut"
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="disponibilite" className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    id="disponibilite"
                    value={formData.disponibilite.toString()}
                    onChange={(e) => setFormData({ ...formData, disponibilite: e.target.value === 'true' })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-2 h-20 w-auto object-cover" />
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  {isEditing ? (
                    <>
                      <FaEdit className="mr-2" /> Update
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" /> Add
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;