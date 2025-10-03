'use client';
import React, { useEffect, useState } from 'react';
import {
  FaUsers, FaStore, FaBoxes, FaSitemap, FaProductHunt, FaSwatchbook,
  FaInvision, FaAmazonPay, FaMoneyBill, FaOutdent, FaTicketAlt, FaCheckCircle,
  FaSpinner, FaExclamationCircle, FaRedo
} from 'react-icons/fa';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    vendors: 0,
    customers: 0,
    sites: 0,
    products: 0,
    purchaseRate: 0,
    soldPurchaseRate: 0,
    restPurchaseRate: 0,
    purchaseInvoice: 0,
    dueAmount: 0,
    demoOut: 0,
    open: 0,
    closed: 0,
    inprogress: 0,
    resolved: 0,
    reopened: 0,
    totalTickets: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const responses = await Promise.all([
          fetch('http://139.59.93.154:8000/vendors/count'),
          fetch('http://139.59.93.154:8000/customers/count'),
          fetch('http://139.59.93.154:8000/sites/count'),
          fetch('http://139.59.93.154:8000/products/count'),
          fetch('http://139.59.93.154:8000/inventory/purchaseRate/count'),
          fetch('http://139.59.93.154:8000/inventory/sold/purchaseRate'),
          fetch('http://139.59.93.154:8000/inventory/rest/sold'),
          fetch('http://139.59.93.154:8000/inventory/count/purchaseInvoice'),
          fetch('http://139.59.93.154:8000/inventory/count/dueAmount'),
          fetch('http://139.59.93.154:8000/inventory/count/demo'),
          fetch('http://139.59.93.154:8000/tickets/count/open'),
          fetch('http://139.59.93.154:8000/tickets/count/closed'),
          fetch('http://139.59.93.154:8000/tickets/count/inprogress'),
          fetch('http://139.59.93.154:8000/tickets/count/resolved'),
          fetch('http://139.59.93.154:8000/tickets/count/reopened'),
          fetch('http://139.59.93.154:8000/tickets/count/all'),
        ]);

        const data = await Promise.all(responses.map(res => res.json()));

        setCounts({
          vendors: data[0],
          customers: data[1],
          sites: data[2],
          products: data[3],
          purchaseRate: data[4],
          soldPurchaseRate: data[5],
          restPurchaseRate: data[6],
          purchaseInvoice: data[7],
          dueAmount: data[8],
          demoOut: data[9],
          open: data[10],
          closed: data[11],
          inprogress: data[12],
          resolved: data[13],
          reopened: data[14],
          totalTickets: data[15],
        });
      } catch (error) {
        console.error('Failed to fetch counts', error);
      }
    };

    fetchCounts();
  }, []);

  const cards = [
    { label: 'Vendors', count: counts.vendors, icon: <FaUsers />, bg: 'bg-indigo-200' },
    { label: 'Customers', count: counts.customers, icon: <FaStore />, bg: 'bg-green-200' },
    { label: 'Sites', count: counts.sites, icon: <FaSitemap />, bg: 'bg-blue-200' },
    { label: 'Products', count: counts.products, icon: <FaBoxes />, bg: 'bg-orange-200' },
    { label: 'Inventory Purchase Value', count: counts.purchaseRate, icon: <FaProductHunt />, bg: 'bg-yellow-200' },
    { label: 'Inventory Sold Value', count: counts.soldPurchaseRate, icon: <FaAmazonPay />, bg: 'bg-red-200' },
    { label: 'Inventory Stock Value', count: counts.restPurchaseRate, icon: <FaSwatchbook />, bg: 'bg-purple-200' },
    { label: 'Purchase Invoices', count: counts.purchaseInvoice, icon: <FaInvision />, bg: 'bg-gray-300' },
    { label: 'Due Amount', count: counts.dueAmount, icon: <FaMoneyBill />, bg: 'bg-teal-200' },
    { label: 'Inventory on Demo', count: counts.demoOut, icon: <FaOutdent />, bg: 'bg-pink-200' },
    { label: 'Total Tickets', count: counts.totalTickets, icon: <FaTicketAlt />, bg: 'bg-rose-300' },
    { label: 'Open Tickets', count: counts.open, icon: <FaTicketAlt />, bg: 'bg-green-300' },
    { label: 'Closed Tickets', count: counts.closed, icon: <FaCheckCircle />, bg: 'bg-gray-400' },
    { label: 'In Progress Tickets', count: counts.inprogress, icon: <FaSpinner />, bg: 'bg-yellow-300' },
    { label: 'Resolved Tickets', count: counts.resolved, icon: <FaExclamationCircle />, bg: 'bg-blue-300' },
    { label: 'Reopened Tickets', count: counts.reopened, icon: <FaRedo />, bg: 'bg-orange-300' },
  ];

  return (
    <div className="w-full bg-gray-50">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-md p-5 sm:p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl ${card.bg}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-700">
                  {card.label}
                </h2>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {card.count}
                </p>
              </div>
              <div className="text-4xl text-gray-700 ml-4">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
