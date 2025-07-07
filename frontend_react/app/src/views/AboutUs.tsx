// src/views/AboutUs.tsx
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Serveur Flex
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Serveur Flex is dedicated to providing high-performance cloud servers and virtual machines to businesses worldwide. Our mission is to empower companies with scalable, reliable, and affordable hosting solutions.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <button
                onClick={() => navigate('/auth/register')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                Contact Us
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <img src="/cloud-server.png" alt="Cloud Server" className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Company Mission */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Mission</h2>
          <p className="text-lg text-gray-600 text-center">
            At Serveur Flex, we aim to simplify cloud hosting with user-friendly tools, robust infrastructure, and exceptional support. Whether you're a startup or an enterprise, we have the perfect solution for you.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutUs;