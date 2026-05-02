import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProductDetail from './pages/ProductDetail';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const API_URL = 'http://localhost:5000/api';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main Layout component (Navbar + Content + Footer)
const MainLayout = ({ children, settings }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin-krfstore-2026');

  return (
    <div className="min-h-screen w-full flex flex-col font-sans text-slate-900 bg-white">
      {!isAdmin && <Navbar settings={settings} />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && <Footer settings={settings} />}

      {/* WhatsApp Floating Button */}
      {!isAdmin && (
        <a
          href={`https://wa.me/91${settings?.upiId ? '9993822286' : '9993822286'}?text=Hi, I saw your website. I'm interested in your products.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8" />
        </a>
      )}
    </div>
  );
};

function App() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/settings`);
        setSettings(res.data);
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <MainLayout settings={settings}>
        <Routes>
          <Route path="/" element={<Homepage settings={settings} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin-krfstore-2026/login" element={<AdminLogin />} />
          <Route path="/admin-krfstore-2026/*" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
