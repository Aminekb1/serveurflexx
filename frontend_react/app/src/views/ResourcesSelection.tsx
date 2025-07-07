// src/views/ResourcesSelection.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { AxiosError } from 'axios';
import { FaServer, FaSearch, FaInfoCircle } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';

interface Resource {
  _id: string;
  nom: string;
  typeRessource: 'server' | 'vm';
  cpu: number;
  ram: number;
  stockage: number;
  nombreHeure: number;
  disponibilite: boolean;
  image?: string;
}

const ResourcesSelection = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'nom' | 'typeRessource' | 'price' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const itemsPerPage = 6;

  const estimatePrice = (cpu: number, ram: number, type: 'server' | 'vm') => {
    const hourlyRate = type === 'vm' ? cpu * 2 + ram * 2 : cpu * 10 + ram * 5;
    return (hourlyRate * (duration || 1)).toFixed(2); // Default to 1 hour if duration is 0
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/ressource/getAllRessources');
        setResources(res.data.filter((r: Resource) => r.disponibilite));
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Failed to fetch resources');
      }
    };
    fetchResources();
  }, []);

  const handleSelectResource = (resourceId: string) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleProceed = () => {
    if (!user) {
      navigate('/auth/register');
      return;
    }
    if (selectedResources.length === 0 || duration <= 0) {
      setError('Please select at least one resource and specify a duration.');
      return;
    }
    navigate('/Payment', { state: { resources: selectedResources, duration } });
  };

  const handleShowDetails = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const filteredResources = resources
    .filter((resource) => {
      const price = parseFloat(estimatePrice(resource.cpu, resource.ram, resource.typeRessource));
      const min = minPrice !== '' ? parseFloat(minPrice.toString()) : 0;
      const max = maxPrice !== '' ? parseFloat(maxPrice.toString()) : Infinity;
      return (
        resource.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.typeRessource.toLowerCase().includes(searchQuery.toLowerCase())
      ) && price >= min && price <= max;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      if (sortField === 'price') {
        const aValue = parseFloat(estimatePrice(a.cpu, a.ram, a.typeRessource));
        const bValue = parseFloat(estimatePrice(b.cpu, b.ram, b.typeRessource));
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = a[sortField];
        const bValue = b[sortField];
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResources = filteredResources.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaServer className="mr-2" /> Select Resources
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
              <div className="flex gap-4">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as 'nom' | 'typeRessource' | 'price' | '')}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sort By</option>
                  <option value="nom">Name</option>
                  <option value="typeRessource">Type</option>
                  <option value="price">Price</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="Min Price"
                    className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="Max Price"
                    className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {/* Duration Input */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentResources.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">No available resources</div>
          ) : (
            currentResources.map((resource) => (
              <div key={resource._id} className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300">
                <div className="p-4">
                  <div className="h-40 bg-gray-200 flex items-center justify-center mb-4 relative">
                    {resource.image ? (
                      <img src={resource.image} alt={resource.nom} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-500">Image</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.nom}</h3>
                  <p className="text-sm text-gray-600 mb-2">Type: {resource.typeRessource}</p>
                  <p className="text-sm font-medium text-gray-800 mb-4">
                    Price: ${estimatePrice(resource.cpu, resource.ram, resource.typeRessource)} (for {duration} hours)
                  </p>
                  <button
                    onClick={() => handleShowDetails(resource)}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <FaInfoCircle className="mr-1" /> View Details
                  </button>
                  <div className="mt-4">
                    <input
                      type="checkbox"
                      checked={selectedResources.includes(resource._id)}
                      onChange={() => handleSelectResource(resource._id)}
                      disabled={!resource.disponibilite}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${resource.disponibilite ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {resource.disponibilite ? 'Available' : 'Unavailable'}
                    </span>
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

        {/* Proceed Button */}
        <div className="mt-6">
          <button
            onClick={handleProceed}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Proceed to Payment
          </button>
        </div>

        {/* Details Modal */}
        {selectedResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedResource.nom}</h3>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedResource.image || 'https://via.placeholder.com/300x200'}
                    alt={selectedResource.nom}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Type: {selectedResource.typeRessource}</p>
                  <dl className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <dt>CPU:</dt>
                      <dd>{selectedResource.cpu} vCPUs</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>RAM:</dt>
                      <dd>{selectedResource.ram} GB</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Storage:</dt>
                      <dd>{selectedResource.stockage} GB</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Hours:</dt>
                      <dd>{selectedResource.nombreHeure}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Hourly Rate:</dt>
                      <dd>${(selectedResource.cpu * (selectedResource.typeRessource === 'vm' ? 2 : 10) + selectedResource.ram * (selectedResource.typeRessource === 'vm' ? 2 : 5)).toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between font-medium text-gray-900">
                      <dt>Total Price (for {duration} hours):</dt>
                      <dd>${estimatePrice(selectedResource.cpu, selectedResource.ram, selectedResource.typeRessource)}</dd>
                    </div>
                  </dl>
                  <span className={`mt-4 inline-block px-2 py-1 rounded-full text-xs ${selectedResource.disponibilite ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedResource.disponibilite ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ResourcesSelection;