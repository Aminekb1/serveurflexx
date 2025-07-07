import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { FaHeadset, FaBook, FaTicketAlt } from 'react-icons/fa';
import { useState } from 'react';

const Support = () => {
  const { loading } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support form submitted:', formData);
    // Integrate with backend API for contact form submission
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
            We're Here to Help
          </h1>
          <p className="text-lg mb-6">
            Get 24/7 support, explore our knowledge base, or submit a ticket for assistance.
          </p>
        </div>
      </div>

      {/* Support Options Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            Support Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaBook className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Knowledge Base</h3>
              <p className="text-gray-600 mb-4">
                Find answers to common questions and guides in our knowledge base.
              </p>
              <a
                href="/support/knowledge-base"
                className="text-blue-600 hover:underline"
              >
                Explore Now
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaTicketAlt className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Support Tickets</h3>
              <p className="text-gray-600 mb-4">
                Submit a ticket for personalized assistance from our team.
              </p>
              <a
                href="/support/tickets"
                className="text-blue-600 hover:underline"
              >
                Submit a Ticket
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <FaHeadset className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Support</h3>
              <p className="text-gray-600 mb-4">
                Chat with our support team 24/7 for immediate help.
              </p>
              <a
                href="/contact"
                className="text-blue-600 hover:underline"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            Get in Touch
          </h2>
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                aria-label="Your name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                aria-label="Your email address"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                rows={5}
                aria-label="Your message"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              aria-label="Submit contact form"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default Support;