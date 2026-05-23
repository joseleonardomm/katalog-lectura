import { useState } from 'react';
import { FaShoppingCart, FaBoxOpen, FaMoneyBillWave, FaTruck, FaClipboardList, FaCalendarCheck } from 'react-icons/fa';
import SalesManager from './SalesManager';
import PurchasesManager from './PurchasesManager';
import TransactionsManager from './TransactionsManager';
import ProvidersManager from './ProvidersManager';
import StockManager from './StockManager';
import FixedExpensesManager from './FixedExpensesManager';
import './InventoryManager.css';

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState('stock');

  const tabs = [
    { id: 'stock', label: 'Stock', icon: <FaClipboardList />, component: <StockManager /> },
    { id: 'sales', label: 'Ventas', icon: <FaShoppingCart />, component: <SalesManager /> },
    { id: 'purchases', label: 'Compras', icon: <FaBoxOpen />, component: <PurchasesManager /> },
    { id: 'transactions', label: 'Finanzas', icon: <FaMoneyBillWave />, component: <TransactionsManager /> },
    { id: 'fixedExpenses', label: 'Gastos fijos', icon: <FaCalendarCheck />, component: <FixedExpensesManager /> },
    { id: 'providers', label: 'Proveedores', icon: <FaTruck />, component: <ProvidersManager /> },
  ];

  return (
    <div className="inventory-manager">
      <div className="inventory-topbar">
        <h2>📦 Inventario</h2>
      </div>
      <div className="inventory-content">
        {tabs.find(t => t.id === activeTab)?.component}
      </div>
      <div className="inventory-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`inventory-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}