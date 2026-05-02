import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, ChevronDown } from 'lucide-react';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import Logo from './Logo';

const Footer = ({ settings }) => {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-900 border-t border-slate-200">
      {/* Top Banner */}
      <div className="w-full bg-slate-50 py-8 border-b border-slate-100 text-center px-4">
        <p className="text-xl md:text-2xl font-light italic text-slate-600 max-w-3xl mx-auto">
          "Introducing Kakinada's finest men's fashion store — where style meets quality."
        </p>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Logo settings={settings} size="medium" dark={false} />
            <p className="mt-6 text-slate-500 font-medium leading-relaxed max-w-xs">
              {settings?.footerTagline || "Your destination for the latest in men's fashion and elite accessories."}
            </p>
            <div className="flex gap-4 mt-8">
              <a href={settings?.instagramUrl || "#"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-secondary hover:text-primary hover:border-secondary transition-all">
                <FaInstagram size={18} />
              </a>
              <a href={settings?.facebookUrl || "#"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-secondary hover:text-primary hover:border-secondary transition-all">
                <FaFacebook size={18} />
              </a>
              <a href="https://wa.me/919993822286" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all">
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="border-t border-slate-100 lg:border-t-0 pt-6 lg:pt-0">
            <button 
              className="w-full flex justify-between items-center lg:cursor-default lg:pointer-events-none"
              onClick={() => toggleAccordion(2)}
            >
              <h3 className="text-secondary font-bold text-lg">Quick Links</h3>
              <ChevronDown className={`lg:hidden transition-transform ${openAccordion === 2 ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`mt-6 space-y-4 lg:block ${openAccordion === 2 ? 'block' : 'hidden'}`}>
              <li><Link to="/" className="text-slate-500 hover:text-secondary font-medium transition-colors">Home</Link></li>
              <li><Link to="/?filter=all" className="text-slate-500 hover:text-secondary font-medium transition-colors">Our Collection</Link></li>
              <li><Link to="/?filter=offers" className="text-slate-500 hover:text-secondary font-medium transition-colors">Special Offers</Link></li>
              <li><a href="#visit-us" className="text-slate-500 hover:text-secondary font-medium transition-colors">Visit Our Store</a></li>
              <li><a href="#contact" className="text-slate-500 hover:text-secondary font-medium transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="border-t border-slate-100 lg:border-t-0 pt-6 lg:pt-0">
            <button 
              className="w-full flex justify-between items-center lg:cursor-default lg:pointer-events-none"
              onClick={() => toggleAccordion(3)}
            >
              <h3 className="text-secondary font-bold text-lg">Categories</h3>
              <ChevronDown className={`lg:hidden transition-transform ${openAccordion === 3 ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`mt-6 space-y-4 lg:block ${openAccordion === 3 ? 'block' : 'hidden'}`}>
              <li><Link to="/?category=men" className="text-slate-500 hover:text-secondary font-medium transition-colors">Men's Wear</Link></li>
              <li><Link to="/?category=footwear" className="text-slate-500 hover:text-secondary font-medium transition-colors">Footwear</Link></li>
              <li><Link to="/?category=accessories" className="text-slate-500 hover:text-secondary font-medium transition-colors">Accessories</Link></li>
              <li><a href="#fresh-arrivals" className="text-slate-500 hover:text-secondary font-medium transition-colors">New Arrivals</a></li>
              <li><Link to="/?filter=sale" className="text-slate-500 hover:text-secondary font-medium transition-colors">Sale Items</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="border-t border-slate-100 lg:border-t-0 pt-6 lg:pt-0" id="contact">
            <button 
              className="w-full flex justify-between items-center lg:cursor-default lg:pointer-events-none"
              onClick={() => toggleAccordion(4)}
            >
              <h3 className="text-secondary font-bold text-lg">Contact Us</h3>
              <ChevronDown className={`lg:hidden transition-transform ${openAccordion === 4 ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`mt-6 space-y-5 lg:block ${openAccordion === 4 ? 'block' : 'hidden'}`}>
              <li className="flex gap-4 items-start">
                <MapPin className="text-secondary shrink-0 mt-1" size={20} />
                <span className="text-slate-500 leading-relaxed font-medium">
                  53, Road No.1, Maruti Nagar,<br />
                  Ramanayyapeta, Kakinada - 533005
                </span>
              </li>
              <li className="flex gap-4 items-center">
                <Phone className="text-secondary shrink-0" size={20} />
                <div className="flex flex-col">
                  <a href="tel:9993822286" className="text-slate-500 hover:text-secondary font-medium transition-colors">9993822286 (Kakinada)</a>
                  <a href="tel:9281425686" className="text-slate-500 hover:text-secondary font-medium transition-colors">9281425686 (Tuni)</a>
                </div>
              </li>
              <li className="flex gap-4 items-center text-slate-500 font-medium">
                <span className="text-secondary font-black shrink-0 w-5 text-center">⏰</span>
                Mon–Sun: 10:00 AM – 9:00 PM
              </li>
              <li className="flex gap-4 items-center">
                <Mail className="text-secondary shrink-0" size={20} />
                <a href={`mailto:${settings?.contactEmail || 'contact@kakinadarajesh.com'}`} className="text-slate-500 hover:text-secondary font-medium transition-colors">
                  {settings?.contactEmail || 'contact@kakinadarajesh.com'}
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <p>© {currentYear} Kakinada Rajesh Fashion Store. All rights reserved.</p>
          <p>Built with ❤️ in Kakinada, Andhra Pradesh</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
