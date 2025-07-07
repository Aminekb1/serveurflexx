// src/views/Contact.tsx
import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    enquiry: 'General Enquiry',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Message sent! We will get back to you soon.');
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      enquiry: 'General Enquiry',
      message: '',
    });
  };

  return (
    <MainLayout>
      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Serveur Flex</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side: Map and Info */}
          <div className="lg:w-1/2">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d144.9537363153167!3d-37.81627977975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ5JzM3LjQiUyAxNDTCsDU3JzEzLjUiRQ!5e0!3m2!1sen!2sau!4v1613636652994!5m2!1sen!2sau"
              width="100%"
              height="300"
              className="rounded-lg mb-6"
              allowFullScreen
              loading="lazy"
            ></iframe>
            <div className="bg-blue-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Reach Out Today</h3>
              <p className="mb-4">Have questions about our hosting services? We’re here to help!</p>
              <h3 className="text-xl font-semibold mb-4">Our Location</h3>
              <p>123 Cloud Street, Tech City, TC 12345</p>
              <p>Email: support@serveurflex.com</p>
              <p>Phone: +1-800-123-4567</p>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:w-1/2">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="firstName">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="lastName">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="phone">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="enquiry">
                  Enquiry Type *
                </label>
                <select
                  id="enquiry"
                  name="enquiry"
                  value={formData.enquiry}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="General Enquiry">General Enquiry</option>
                  <option value="VPS Setup">VPS Setup</option>
                  <option value="Billing">Billing</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Write your message here..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;