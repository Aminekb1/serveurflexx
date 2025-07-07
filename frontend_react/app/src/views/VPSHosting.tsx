import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { FaServer, FaBolt, FaShieldAlt, FaCogs } from 'react-icons/fa';

const VPSHosting = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-500 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/assets/cloud-pattern.webp"
            alt="Background Pattern"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scalable VPS Hosting for Your Needs
            </h1>
            <p className="text-lg mb-6">
              Deploy high-performance virtual private servers with Serveur Flex. Flexible, secure, and easy to manage.
            </p>
            <button
              onClick={() => navigate('/configure-server?type=vps')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-transform transform hover:scale-105"
            >
              Configure Your VPS
            </button>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0 animate-fade-in-right">
            <img
              src="src/assets/vps-hosting.webp"
              alt="VPS Hosting"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            Why Choose Our VPS Hosting?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaServer className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">High Performance</h3>
              <p className="text-gray-600">
                Powered by SSDs and top-tier hardware for blazing-fast performance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaBolt className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Scalability</h3>
              <p className="text-gray-600">
                Upgrade or downgrade resources instantly to match your needs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaShieldAlt className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enhanced Security</h3>
              <p className="text-gray-600">
                Built-in DDoS protection and secure isolation for your VPS.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaCogs className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Full Control</h3>
              <p className="text-gray-600">
                Root access and customizable configurations for ultimate flexibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VPSHosting;