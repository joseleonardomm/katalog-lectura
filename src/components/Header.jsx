import React, { useState, useRef, useEffect } from 'react';
import { FaShoppingCart, FaChartLine } from 'react-icons/fa';
import './Header.css';

function Header({ searchTerm, setSearchTerm, currencies, currency, setCurrency, cartCount, onCartClick, formatPrice, config }) {
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const dropdownRef = useRef(null);
  const primaryColor = config?.primaryColor || '#ff8c42';
  const secondaryColor = config?.secondaryColor || '#e06e1a';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsCurrencyOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header-fixed" style={{ borderBottomColor: primaryColor, backgroundColor: config?.headerBgColor || '#ffffff' }}>
      <div className="header-container">
        <div className="logo">
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" height="50" style={{ maxHeight: '50px', width: 'auto' }} />
          ) : (
            <h1 style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              {config?.siteName || 'Katalog'}
            </h1>
          )}
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar productos... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="header-actions">
          <div className="currency-menu" ref={dropdownRef}>
            <button className="hamburger-currency" style={{ color: primaryColor, borderColor: primaryColor }} onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}>
              <FaChartLine />
            </button>
            {isCurrencyOpen && (
              <div className="currency-dropdown show">
                {currencies.map(c => (
                  <div key={c.code} onClick={() => { setCurrency(c.code); setIsCurrencyOpen(false); }}>
                    {c.symbol} {c.code}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="cart-icon" onClick={onCartClick} style={{ color: primaryColor, borderColor: primaryColor }}>
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-count" style={{ backgroundColor: primaryColor }}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;