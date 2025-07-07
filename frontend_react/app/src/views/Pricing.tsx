import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { useState } from 'react';

const Pricing = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const vpsPrices = {
    basic: { monthly: 9.99, yearly: 107.89 },
    pro: { monthly: 19.99, yearly: 215.89 },
    enterprise: { monthly: 39.99, yearly: 431.89 },
  };

  const dedicatedPrices = {
    starter: { monthly: 99.99, yearly: 1079.89 },
    advanced: { monthly: 199.99, yearly: 2159.89 },
    premium: { monthly: 399.99, yearly: 4319.89 },
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Affordable Plans for Every Need
          </h1>
          <p className="text-lg mb-6">
            Choose from our flexible VPS and dedicated server plans, tailored to your business.
          </p>
        </div>
      </div>

      {/* Pricing Toggle */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-lg ${!isYearly ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-lg ${isYearly ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              Yearly (Save 10%)
            </button>
          </div>
        </div>
      </div>

      {/* VPS Pricing Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            VPS Hosting Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Basic VPS</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                ${vpsPrices.basic[isYearly ? 'yearly' : 'monthly'].toFixed(2)}/{isYearly ? 'yr' : 'mo'}
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>1 vCPU</li>
                <li>2 GB RAM</li>
                <li>50 GB SSD</li>
                <li>1 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=basic&type=vps')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center relative border-2 border-blue-600 hover:shadow-xl transition-shadow">
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-sm px-3 py-1 rounded-bl-lg">
                Most Popular
              </span>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Pro VPS</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                ${vpsPrices.pro[isYearly ? 'yearly' : 'monthly'].toFixed(2)}/{isYearly ? 'yr' : 'mo'}
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>2 vCPUs</li>
                <li>4 GB RAM</li>
                <li>100 GB SSD</li>
                <li>2 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=pro&type=vps')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise VPS</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                ${vpsPrices.enterprise[isYearly ? 'yearly' : 'monthly'].toFixed(2)}/{isYearly ? 'yr' : 'mo'}
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>4 vCPUs</li>
                <li>8 GB RAM</li>
                <li>200 GB SSD</li>
                <li>5 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=enterprise&type=vps')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Servers Pricing Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            Dedicated Server Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Starter Dedicated</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                ${dedicatedPrices.starter[isYearly ? 'yearly' : 'monthly'].toFixed(2)}/{isYearly ? 'yr' : 'mo'}
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>4 Cores</li>
                <li>16 GB RAM</li>
                <li>500 GB SSD</li>
                <li>10 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=starter&type=dedicated')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center relative border-2 border-blue-600 hover:shadow-xl transition-shadow">
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-sm px-3 py-1 rounded-bl-lg">
                Most Popular
              </span>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Advanced Dedicated</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                ${dedicatedPrices.advanced[isYearly ? 'yearly' : 'monthly'].toFixed(2)}/{isYearly ? 'yr' : 'mo'}
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>8 Cores</li>
                <li>32 GB RAM</li>
                <li>1 TB SSD</li>
                <li>20 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=advanced&type=dedicated')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Premium Dedicated</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                ${dedicatedPrices.premium[isYearly ? 'yearly' : 'monthly'].toFixed(2)}/{isYearly ? 'yr' : 'mo'}
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>16 Cores</li>
                <li>64 GB RAM</li>
                <li>2 TB SSD</li>
                <li>50 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=premium&type=dedicated')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pricing;