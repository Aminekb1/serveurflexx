import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileInvoice } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AxiosError } from 'axios';

// Define Invoice interface
interface Invoice {
  _id: string;
  client: string;
  montant: number;
  statutPaiement: string;
}

const Invoices = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      const fetchInvoices = async () => {
        try {
          const res = await api.get('/factures/getAllFactures');
          setInvoices(res.data); // Removed filter: invoice.client === user._id
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          setError(axiosError.response?.data?.message || 'Failed to fetch invoices');
        }
      };
      fetchInvoices();
    }
  }, [user]);

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      await api.post(`/factures/${invoiceId}/payer`, { methodePaiement: 'credit_card' });
      setInvoices(invoices.map((inv: Invoice) =>
        inv._id === invoiceId ? { ...inv, statutPaiement: 'payé' } : inv
      ));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Payment failed');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <FaFileInvoice className="mr-2" /> My Invoices
      </h2>
      {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-600">No invoices found</td>
                </tr>
              ) : (
                invoices.map((invoice: Invoice) => (
                  <tr key={invoice._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{invoice._id}</td>
                    {/* <td className="px-6 py-4">€{invoice.montant}</td> */}
                    <td className="px-6 py-4">{invoice.montant}TND</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          invoice.statutPaiement === 'payé' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {invoice.statutPaiement}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.statutPaiement !== 'payé' && (
                        <button
                          onClick={() => handlePayInvoice(invoice._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;