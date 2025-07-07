import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { FaServer, FaShieldAlt, FaHeadset, FaBolt } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useState } from 'react';

const Landing = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');

  const handleDomainSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Domain searched:', domain);
    // Integrate with backend API for domain search
   navigate('/domain-search?query=' + encodeURIComponent(domain));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Slider settings for testimonials
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

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
              Launch Your Business with Powerful Cloud Solutions
            </h1>
            <p className="text-lg mb-6">
              Rent high-performance servers and scalable VMs with Serveur Flex. Instant setup, 24/7 support, and 99.9% uptime guaranteed.
            </p>
            <form onSubmit={handleDomainSearch} className="mb-6 flex justify-center lg:justify-start">
              <input
                type="text"
                placeholder="Find your domain (e.g., yoursite.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full max-w-md p-3 rounded-l-lg text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100"
              >
                Search
              </button>
            </form>
            <div className="flex justify-center lg:justify-start space-x-4">
              <button
                onClick={() => navigate('/configure-server')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-transform transform hover:scale-105"
              >
                Configure Your Server
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-transform transform hover:scale-105"
              >
                View Pricing
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0 animate-fade-in-right">
            <img
              src="src\assets\server-data-center.webp"
              alt="Data Center"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            Why Choose Serveur Flex?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaServer className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">High-Performance Servers</h3>
              <p className="text-gray-600 mb-4">
                Deploy servers with top-tier hardware for maximum performance.
              </p>
              <a
                href="/features"
                className="text-blue-600 hover:underline"
              >
                Learn More
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaBolt className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Scalable VMs</h3>
              <p className="text-gray-600 mb-4">
                Scale your virtual machines effortlessly to meet your needs.
              </p>
              <a
                href="/features"
                className="text-blue-600 hover:underline"
              >
                Learn More
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaShieldAlt className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">DDoS Protection</h3>
              <p className="text-gray-600 mb-4">
                Stay secure with advanced DDoS protection for all plans.
              </p>
              <a
                href="/features"
                className="text-blue-600 hover:underline"
              >
                Learn More
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaHeadset className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600 mb-4">
                Our team is available around the clock to assist you.
              </p>
              <a
                href="/support"
                className="text-blue-600 hover:underline"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            Our Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Basic VPS</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">$9.99/mo</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>1 vCPU</li>
                <li>2 GB RAM</li>
                <li>50 GB SSD</li>
                <li>1 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=basic')}
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
              <p className="text-4xl font-bold text-blue-600 mb-4">$19.99/mo</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>2 vCPUs</li>
                <li>4 GB RAM</li>
                <li>100 GB SSD</li>
                <li>2 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=pro')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise VPS</h3>
              <p className="text-4xl font-bold text-blue-600 mb-4">$39.99/mo</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>4 vCPUs</li>
                <li>8 GB RAM</li>
                <li>200 GB SSD</li>
                <li>5 TB Bandwidth</li>
              </ul>
              <button
                onClick={() => navigate('/configure-server?plan=enterprise')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            What Our Customers Say
          </h2>
          <Slider {...sliderSettings}>
            <div className="px-2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <img
                  src="src/assets/customer1.jpg"
                  alt="Molka Kbaier"
                  className="w-12 h-12 rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 mb-4">
                  "Serveur Flex made it easy to scale our app with their reliable VPS solutions."
                </p>
                <p className="text-gray-900 font-semibold">Molka Kbaier, CEO of TechCorp</p>
              </div>
            </div>
            <div className="px-2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <img
                  src="src/assets/customer2.jpg"
                  alt="Amine Kbaier"
                  className="w-12 h-12 rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 mb-4">
                  "The support team is fantastic! They helped us set up our server in no time."
                </p>
                <p className="text-gray-900 font-semibold">Amine Kbaier, Developer</p>
              </div>
            </div>
            <div className="px-2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <img
                  src="src/assets/customer3.jpg"
                  alt="Siwar Aouididi"
                  className="w-12 h-12 rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 mb-4">
                  "Affordable pricing and powerful servers. Highly recommend Serveur Flex!"
                </p>
                <p className="text-gray-900 font-semibold">Siwar Aouididi, Startup Founder</p>
              </div>
            </div>
          </Slider>
        </div>
      </div>

      {/* Trust Signals Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            Trusted by Businesses 
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <img
              src="src/assets/partner1.png"
              alt="Partner 1"
              className="max-h-16 w-auto hover:scale-110 transition-transform duration-300"
            />
            <img
              src="src/assets/partner2.png"
              alt="Partner 2"
              className="max-h-16 w-auto hover:scale-110 transition-transform duration-300"
            />
            <img
              src="src/assets/partner3.png"
              alt="Partner 3"
              className="max-h-16 w-auto hover:scale-110 transition-transform duration-300"
            />
            <img
              src="src/assets/partner4.png"
              alt="Partner 4"
              className="max-h-16 w-auto hover:scale-110 transition-transform duration-300"
            />
          </div>
          <p className="text-center text-gray-600 mt-8">
            ISO 27001 Certified | 99.9% Uptime Guarantee
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Landing;