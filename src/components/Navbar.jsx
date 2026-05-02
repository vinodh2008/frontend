import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Search, User, Menu, X, ChevronDown } from 'lucide-react';
import Logo from './Logo';

const Navbar = ({ settings }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync search input with URL params
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
    if (q) setShowSearch(true);
  }, [searchParams]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Only update URL if we are on homepage or search is active
    if (location.pathname === '/') {
      const newParams = new URLSearchParams(searchParams);
      if (val) newParams.set('search', val);
      else newParams.delete('search');
      setSearchParams(newParams);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSearch(false);
  }, [location.pathname]);

  const navLinks = [
    {
      name: 'MEN',
      dropdown: ['Shirts', 'Trousers', 'Ethnic Wear', 'Formals']
    },
    {
      name: 'FOOTWEAR',
      dropdown: ['Casual', 'Formal', 'Sports']
    },
    {
      name: 'ACCESSORIES',
      dropdown: ['Belts', 'Wallets', 'Watches', 'Bags']
    }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top Bar Strip */}
      <div className="bg-slate-900 text-white text-[11px] sm:text-xs font-semibold py-1.5 px-4 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="hidden sm:inline">📞 Helpline: 9993822286 | 9281425686</span>
          <span className="sm:hidden">📞 9993822286</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-secondary tracking-widest uppercase">🚚 NO Free Delivery </span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-white py-4'} px-4 lg:px-12 flex justify-between items-center border-b border-slate-100`}>

        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3">
          <Logo settings={settings} size="medium" />
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group cursor-pointer">
              <span className="text-sm font-bold text-slate-800 hover:text-secondary transition-colors flex items-center gap-1 py-4">
                {link.name} <ChevronDown size={14} className="text-slate-400 group-hover:text-secondary group-hover:rotate-180 transition-transform" />
              </span>

              {/* Dropdown */}
              <div className="absolute top-full left-0 bg-white shadow-xl border border-slate-100 rounded-xl py-2 min-w-[200px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                {link.dropdown.map((item) => (
                  <Link
                    key={item}
                    to={`/?category=${link.name.toLowerCase()}&sub=${item.toLowerCase()}`}
                    className="block px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link to="/?filter=sale" className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1 relative py-4">
            SALE
            <span className="absolute top-2 -right-3 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-2 -right-3 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className={`relative flex items-center transition-all duration-300 ${showSearch ? 'w-48 md:w-64' : 'w-10'}`}>
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className={`w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-xs font-bold focus:ring-secondary focus:border-secondary transition-all ${showSearch ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            />
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="absolute left-0 text-slate-700 hover:text-secondary transition-colors p-2"
            >
              <Search size={22} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-slate-900 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 pt-32 px-6 overflow-y-auto lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col gap-6">
          {navLinks.map((link) => (
            <div key={link.name} className="border-b border-slate-100 pb-4">
              <span className="text-lg font-black text-primary mb-3 block">{link.name}</span>
              <div className="flex flex-col gap-3 pl-4">
                {link.dropdown.map((item) => (
                  <Link
                    key={item}
                    to={`/?category=${link.name.toLowerCase()}&sub=${item.toLowerCase()}`}
                    className="text-slate-500 font-medium hover:text-secondary"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link to="/?filter=sale" className="text-lg font-black text-red-500 py-2">
            🔥 CLEARANCE SALE
          </Link>

          {/* Section Links for Mobile */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
            <a href="#fresh-arrivals" className="text-slate-600 font-bold hover:text-secondary">✨ New Arrivals</a>
            <a href="#collection" className="text-slate-600 font-bold hover:text-secondary">📦 Our Collection</a>
            <a href="#visit-us" className="text-slate-600 font-bold hover:text-secondary">📍 Visit Our Store</a>
            <a href="#contact" className="text-slate-600 font-bold hover:text-secondary">📞 Contact Us</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
