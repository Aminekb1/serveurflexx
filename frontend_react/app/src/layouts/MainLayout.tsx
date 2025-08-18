// src/layouts/MainLayout.tsx
import { ReactNode } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="src/assets/images/Ooredoo_logo (1).svg"
              alt="Serveur Flex Logo"
              className="h-10 w-auto"
            />
          </div>
          <div className="hidden md:flex space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/VPSHosting"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }
            >
              VPS Hosting
            </NavLink>
            <NavLink
              to="/DedicatedServers"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }
            >
              Dedicated Servers
            </NavLink>
            <NavLink
              to="/Pricing"
              className={({

 isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }
            >
              Pricing
            </NavLink>
            <NavLink
              to="/Support"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }
            >
              Support
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }
            >
              Resources
            </NavLink>
            <NavLink
                  to="/MyResources"
                  className={({ isActive }) =>
                    isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                  }
                >
                  my commandes
                </NavLink>
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                }
              >
                Dashboard
              </NavLink>
            )}
          </div>
          <div className="flex items novedades-center space-x-4">
            <input
              type="text"
              placeholder="Search your domain..."
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            {user ? (
              <button
                onClick={() => logout()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img
                  src="src/assets/images/Ooredoo_logo (1).svg"
                  alt="Serveur Flex Logo"
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400">
                © 2025 Serveur Flex. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li><a href="/vps-hosting" className="text-gray-400 hover:text-white">VPS Hosting</a></li>
                <li><a href="/dedicated-servers" className="text-gray-400 hover:text-white">Dedicated Servers</a></li>
                <li><a href="/cloud-hosting" className="text-gray-400 hover:text-white">Cloud Hosting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/support/knowledge-base" className="text-gray-400 hover:text-white">Knowledge Base</a></li>
                <li><a href="/support/tickets" className="text-gray-400 hover:text-white">Support Tickets</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://facebook.com/serveurflex" className="text-gray-400 hover:text-white">
                  <FaFacebook size={24} />
                </a>
                <a href="https://twitter.com/serveurflex" className="text-gray-400 hover:text-white">
                  <FaTwitter size={24} />
                </a>
                <a href="https://instagram.com/serveurflex" className="text-gray-400 hover:text-white">
                  <FaInstagram size={24} />
                </a>
            </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;