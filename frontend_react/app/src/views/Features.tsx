// src/views/Features.tsx
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { FaServer, FaRocket, FaLock } from 'react-icons/fa';

const Features = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Serveur Flex Features
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover the powerful features that make Serveur Flex the ideal choice for cloud hosting and VM rental.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <button
                onClick={() => navigate('/auth/register')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                View Pricing
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <img src="/hosting-features.png" alt="Hosting Features" className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Features List Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <FaRocket className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Deployment</h3>
              <p className="text-gray-600">
                Launch your server or VM in minutes with our automated setup.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <FaServer className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multiple OS Options</h3>
              <p className="text-gray-600">
                Choose from Linux, Windows, or custom OS for your servers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <FaLock className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">High Availability</h3>
              <p className="text-gray-600">
                Ensure uptime with our redundant infrastructure and 99.9% SLA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Features;