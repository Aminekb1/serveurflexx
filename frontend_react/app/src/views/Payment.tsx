// src/views/Payment.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import { AxiosError } from 'axios';
import { FaCheckCircle, FaCreditCard, FaDownload } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('carte');
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [invoicePdf, setInvoicePdf] = useState<string | null>(null);

  useEffect(() => {
    if (!state?.resources || !state?.duration) {
      navigate('/resources-selection');
      return;
    }
    const fetchResources = async () => {
      try {
        const res = await api.get('/ressource/getAllRessources');
        const selected = res.data.filter((r: Resource) => state.resources.includes(r._id));
        setResources(selected);
        setDuration(state.duration);
        setOrderId(`ORD-${Date.now()}`);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Failed to fetch resources');
      }
    };
    fetchResources();
  }, [state, navigate]);

  const estimatePrice = (cpu: number, ram: number, type: 'server' | 'vm') => {
    const hourlyRate = type === 'vm' ? cpu * 2 + ram * 2 : cpu * 10 + ram * 5;
    return (hourlyRate * duration).toFixed(2);
  };

  const totalPrice = resources.reduce((sum, resource) => sum + parseFloat(estimatePrice(resource.cpu, resource.ram, resource.typeRessource)), 0);
  const discountedPrice = totalPrice - (totalPrice * (discount / 100));

  const applyDiscount = () => {
    if (discountCode === 'PROMO10') {
      setDiscount(10);
      setError('');
    } else {
      setDiscount(0);
      setError('Invalid discount code.');
    }
  };

  const handleNext = () => {
    if (step === 1 && resources.length === 0) {
      setError('No resources selected.');
      return;
    }
    setStep(step + 1);
    setError('');
  };

  const handlePrev = () => {
    setStep(step - 1);
    setError('');
  };

  const generateInvoice = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font and add header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Serveur Flex Invoice', 105, 20, { align: 'center' });

    // Invoice details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Number: ${orderId}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleString('en-US', { timeZone: 'CET', dateStyle: 'full', timeStyle: 'medium' })}`, 20, 50);
    doc.text(`Payment Method: ${paymentMethod === 'carte' ? 'Credit Card' : paymentMethod === 'virement' ? 'Bank Transfer' : 'PayPal'}`, 20, 60);

    // Bill To
    doc.text('Bill To:', 20, 80);
    doc.text(user?.email || 'Client Name', 20, 90);
    doc.text(user?.address || 'No address provided', 20, 100);

    // Table setup with autoTable
    autoTable(doc, {
      startY: 120,
      head: [['Item', 'Description', 'Unit Price ($)', 'Quantity (hrs)', 'Total ($)']],
      body: resources.map(r => [
        `${r.nom} (${r.typeRessource})`,
        `CPU: ${r.cpu}, RAM: ${r.ram}GB, Storage: ${r.stockage}GB`,
        estimatePrice(r.cpu, r.ram, r.typeRessource),
        duration,
        (parseFloat(estimatePrice(r.cpu, r.ram, r.typeRessource)) * duration).toFixed(2)
      ]),
      foot: [
        ['Subtotal', '', '', '', totalPrice.toFixed(2)],
        ['Discount', `${discount}% off`, '', '', `-${(totalPrice * (discount / 100)).toFixed(2)}`],
        ['Total', '', '', '', discountedPrice.toFixed(2)]
      ],
      styles: { halign: 'right', fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], halign: 'center' },
      footStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], halign: 'right' }
    });

    // Get the last autoTable finalY
    const finalY = (doc as any).lastAutoTable.finalY; // Type assertion due to missing official typing
    doc.text('Thank you for your business!', 105, finalY + 10, { align: 'center' });

    // Generate PDF and set for download
    const pdfData = doc.output('datauristring');
    setInvoicePdf(pdfData);
  };

  const downloadInvoice = () => {
    if (invoicePdf) {
      const link = document.createElement('a');
      link.href = invoicePdf;
      link.download = `invoice_${orderId}.pdf`;
      link.click();
    }
  };

  const handleSubmit = async () => {
    if (!cardNumber && paymentMethod === 'carte' || !paypalEmail && paymentMethod === 'paypal') {
      setError('Please enter payment details.');
      return;
    }
    try {
      const commandeData = {
        id: `CMD-${Date.now()}`,
        client: user?._id || '',
        dateCommande: new Date().toISOString(),
        ressources: resources.map(r => r._id),
      };
      const factureData = {
        id: `FAC-${Date.now()}`,
        montant: discountedPrice,
        methodePaiement: paymentMethod,
        statutPaiement: 'pending',
        client: user?._id || '',
        commande: 'commande-id-placeholder',
        paymentDetails: paymentMethod === 'carte' ? { cardNumber } : { paypalEmail },
      };

      const commandeRes = await api.post('/commandes/createCommande', commandeData);
      factureData.commande = commandeRes.data._id;
      await api.post('/factures/createFacture', factureData);

      generateInvoice();
      alert('Order placed and payment initiated! Implement payment gateway here.');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Failed to process order.');
    }
  };

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Checkout</h2>
          <div className="flex justify-between mb-8">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="flex items-center justify-center mb-2">
                <FaCheckCircle className="mr-2" /> 1. Review Order
              </div>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="flex items-center justify-center mb-2">
                <FaCheckCircle className="mr-2" /> 2. Confirmation
              </div>
            </div>
            <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="flex items-center justify-center mb-2">
                <FaCreditCard className="mr-2" /> 3. Payment
              </div>
            </div>
          </div>
          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <p className="text-sm text-gray-600 mb-4">Order ID: {orderId}</p>
              <div className="space-y-4 mb-6">
                {resources.map((resource) => (
                  <div key={resource._id} className="flex justify-between items-center p-4 border-b border-gray-200">
                    <span>{resource.nom} ({resource.typeRessource})</span>
                    <span>${estimatePrice(resource.cpu, resource.ram, resource.typeRessource)}</span>
                  </div>
                ))}
              </div>
              <dl className="text-sm text-gray-600 space-y-2 mb-6">
                <div className="flex justify-between">
                  <dt>Subtotal:</dt>
                  <dd>${totalPrice.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping:</dt>
                  <dd>$0.00</dd>
                </div>
                <div className="flex justify-between font-medium text-gray-900">
                  <dt>Total:</dt>
                  <dd>${totalPrice.toFixed(2)}</dd>
                </div>
              </dl>
              <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Next
              </button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmation</h3>
              <p className="text-sm text-gray-600 mb-4">Please review your order before proceeding to payment.</p>
              <div className="space-y-4 mb-6">
                {resources.map((resource) => (
                  <div key={resource._id} className="flex justify-between items-center p-4 border-b border-gray-200">
                    <span>{resource.nom} ({resource.typeRessource})</span>
                    <span>${estimatePrice(resource.cpu, resource.ram, resource.typeRessource)}</span>
                  </div>
                ))}
              </div>
              <dl className="text-sm text-gray-600 space-y-2 mb-6">
                <div className="flex justify-between">
                  <dt>Subtotal:</dt>
                  <dd>${totalPrice.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Discount:</dt>
                  <dd>-${((totalPrice * (discount / 100)).toFixed(2))}</dd>
                </div>
                <div className="flex justify-between font-medium text-gray-900">
                  <dt>Total:</dt>
                  <dd>${discountedPrice.toFixed(2)}</dd>
                </div>
              </dl>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyDiscount}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={handlePrev} className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400">
                  Back
                </button>
                <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                  Next
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="carte">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="virement">Bank Transfer</option>
                </select>
                {paymentMethod === 'carte' && (
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Enter card number"
                    className="w-full mt-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {paymentMethod === 'paypal' && (
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="Enter PayPal email"
                    className="w-full mt-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {paymentMethod === 'virement' && (
                  <p className="mt-4 text-sm text-gray-600">Contact support for bank details.</p>
                )}
              </div>
              <dl className="text-sm text-gray-600 space-y-2 mb-6">
                <div className="flex justify-between">
                  <dt>Total Amount:</dt>
                  <dd>${discountedPrice.toFixed(2)}</dd>
                </div>
              </dl>
              {invoicePdf && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Invoice</h4>
                  <button
                    onClick={downloadInvoice}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download Invoice
                  </button>
                  <button
                    onClick={handleFinish}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Return to Home
                  </button>
                </div>
              )}
              <div className="flex justify-between">
                <button onClick={handlePrev} className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400">
                  Back
                </button>
                <button onClick={handleSubmit} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center">
                  <FaCheckCircle className="mr-2" /> Confirm Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Payment;