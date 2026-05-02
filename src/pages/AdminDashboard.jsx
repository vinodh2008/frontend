import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Tag, ShoppingBag, Star, Layout, Image as ImageIcon, Link as LinkIcon, Settings, Save, LogOut, Globe, Menu, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin-krfstore-2026/login');
    }
  }, [token, navigate]);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [activeTab, setActiveTab] = useState('products');

  // Data States
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({ pending: [], approved: [] });
  const [settings, setSettings] = useState({});

  // Loading States
  const [loading, setLoading] = useState(false);

  // Forms State
  const [productForm, setProductForm] = useState({ 
    name: '', price: '', category: 'Men', inStock: true, isFeatured: false, 
    description: '', images: null, quantity: '', deliveryDays: 3, appliedOffer: '',
    sizes: [],
    bulkDiscount: { minQty: '', discountPct: '' }
  });
  const [offerForm, setOfferForm] = useState({ title: '', emoji: '🎊', tagline: '', description: '', discount: '', category: 'All', validTill: '', bannerColor: '#F59E0B', isActive: true });

  // Toast State
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Settings Forms State
  const [settingsForm, setSettingsForm] = useState({
    upiId: '', instagramUrl: '', facebookUrl: '', contactEmail: '', footerTagline: '',
    catMen: '', catFootwear: '', catAccessories: ''
  });
  const [settingsFiles, setSettingsFiles] = useState({ logoImage: null, upiQrCode: null });
  const [heroSlides, setHeroSlides] = useState([]);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, offRes, ordRes, revAppRes, revPenRes, setRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/offers`),
        axios.get(`${API_URL}/admin/orders`, authHeaders),
        axios.get(`${API_URL}/reviews/approved`),
        axios.get(`${API_URL}/admin/reviews/pending`, authHeaders),
        axios.get(`${API_URL}/settings`)
      ]);
      setProducts(prodRes.data);
      setOffers(offRes.data);
      setOrders(ordRes.data);
      setReviews({ pending: revPenRes.data, approved: revAppRes.data });

      const s = setRes.data;
      setSettings(s);
      setSettingsForm({
        upiId: s.upiId || '9993822286@upi',
        instagramUrl: s.instagramUrl || '',
        facebookUrl: s.facebookUrl || '',
        contactEmail: s.contactEmail || '',
        footerTagline: s.footerTagline || '',
        catMen: s.categoryImages?.men || '',
        catFootwear: s.categoryImages?.footwear || '',
        catAccessories: s.categoryImages?.accessories || ''
      });
      setHeroSlides(s.heroSlides || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Handlers ---

  // Products
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(productForm).forEach(k => {
        // Skip null/undefined values (especially images when no file is selected)
        if (productForm[k] === null || productForm[k] === undefined) return;
        
        if (k === 'sizes' || k === 'bulkDiscount') {
          data.append(k, JSON.stringify(productForm[k]));
        } else if (k === 'images') {
          // images is handled separately below via the file input
          return;
        } else {
          data.append(k, productForm[k]);
        }
      });

      // Handle image files properly
      if (productForm.images) {
        // If it's a FileList (multiple files) or a single File
        if (productForm.images instanceof FileList) {
          for (let i = 0; i < productForm.images.length; i++) {
            data.append('images', productForm.images[i]);
          }
        } else if (productForm.images instanceof File) {
          data.append('images', productForm.images);
        }
      }

      // Handle video file if present
      if (productForm.video) {
        data.append('video', productForm.video);
      }

      await axios.post(`${API_URL}/admin/products`, data, authHeaders);
      showToast('Product saved!');
      setProductForm({ 
        name: '', price: '', category: 'Men', inStock: true, isFeatured: false, 
        description: '', images: null, video: null, quantity: '', deliveryDays: 3, appliedOffer: '',
        sizes: [],
        bulkDiscount: { minQty: '', discountPct: '' }
      });
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      console.error('Product save error:', err.response?.data || err);
      alert('Error saving product: ' + errMsg);
    }
  };

  const addSizeRow = () => {
    setProductForm({
      ...productForm,
      sizes: [...productForm.sizes, { label: '', sizeType: 'Clothing', quantity: 0, priceAdjust: 0 }]
    });
  };

  const updateSizeRow = (index, field, value) => {
    const updatedSizes = [...productForm.sizes];
    updatedSizes[index][field] = value;
    
    // Calculate total quantity from sizes
    const totalQty = updatedSizes.reduce((acc, s) => acc + (parseInt(s.quantity) || 0), 0);
    
    setProductForm({
      ...productForm,
      sizes: updatedSizes,
      quantity: totalQty // Auto-update main quantity
    });
  };

  const removeSizeRow = (index) => {
    const updatedSizes = productForm.sizes.filter((_, i) => i !== index);
    const totalQty = updatedSizes.reduce((acc, s) => acc + (parseInt(s.quantity) || 0), 0);
    setProductForm({ ...productForm, sizes: updatedSizes, quantity: totalQty });
  };
  const deleteProduct = async (id) => {
    if (window.confirm('Delete?')) { await axios.delete(`${API_URL}/admin/products/${id}`, authHeaders); showToast('Product deleted'); fetchData(); }
  };

  // Offers
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/offers`, offerForm, authHeaders);
      showToast('Offer saved!');
      setOfferForm({ title: '', emoji: '🎊', tagline: '', description: '', discount: '', category: 'All', validTill: '', bannerColor: '#F59E0B', isActive: true });
      fetchData();
    } catch (err) { alert('Error saving offer'); }
  };
  const deleteOffer = async (id) => {
    if (window.confirm('Delete?')) { await axios.delete(`${API_URL}/admin/offers/${id}`, authHeaders); showToast('Offer deleted'); fetchData(); }
  };
  const toggleOffer = async (id) => {
    await axios.put(`${API_URL}/admin/offers/${id}`, {}, authHeaders); showToast('Offer toggled'); fetchData();
  };

  // Orders
  const updateOrderStatus = async (id, status) => {
    await axios.put(`${API_URL}/admin/orders/${id}/status`, { orderStatus: status }, authHeaders); showToast('Order status updated'); fetchData();
  };

  // Reviews
  const approveReview = async (id) => {
    await axios.put(`${API_URL}/admin/reviews/${id}/approve`, {}, authHeaders); showToast('Review approved'); fetchData();
  };
  const deleteReview = async (id) => {
    if (window.confirm('Delete review?')) { await axios.delete(`${API_URL}/admin/reviews/${id}`, authHeaders); showToast('Review deleted'); fetchData(); }
  };

  // Settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(settingsForm).filter(k => !k.startsWith('cat')).forEach(k => data.append(k, settingsForm[k]));

    const catImages = { men: settingsForm.catMen, footwear: settingsForm.catFootwear, accessories: settingsForm.catAccessories };
    data.append('categoryImages', JSON.stringify(catImages));
    data.append('heroSlides', JSON.stringify(heroSlides));

    if (settingsFiles.logoImage) data.append('logoImage', settingsFiles.logoImage);
    if (settingsFiles.upiQrCode) data.append('upiQrCode', settingsFiles.upiQrCode);

    try {
      await axios.put(`${API_URL}/admin/settings`, data, authHeaders);
      showToast('Settings updated successfully!');
      fetchData();
    } catch (err) { alert('Error updating settings'); }
  };

  const addHeroSlide = () => {
    setHeroSlides([...heroSlides, { imageUrl: '', title: 'New Slide', subtitle: 'Subtitle here', buttonText: 'Shop Now' }]);
  };

  const updateSlide = (index, field, value) => {
    const updated = [...heroSlides];
    updated[index][field] = value;
    setHeroSlides(updated);
  };

  const removeSlide = (index) => {
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  };

  // --- Render Tabs ---
  const tabs = [
    { id: 'products', name: 'Products', icon: Package },
    { id: 'offers', name: 'Offers', icon: Tag },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'reviews', name: 'Reviews', icon: Star },
    { id: 'appearance', name: 'Appearance', icon: Layout }
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on tab change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);
  
  // Sidebar Content (Extracted for reuse)
  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h2 className="text-xl font-black text-secondary tracking-tighter">Admin Panel</h2>
      </div>
      <nav className="flex flex-col gap-2 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === tab.id ? 'bg-secondary text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <tab.icon size={20} /> {tab.name}
          </button>
        ))}
        <div className="border-t border-white/10 my-4 pt-4">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-slate-400 hover:text-white hover:bg-white/5">
            <Globe size={20} /> Go to Website
          </Link>
          <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin-krfstore-2026/login'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-red-400 hover:text-white hover:bg-red-500/20 mt-2">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </nav>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 pt-16">

      {toastMsg && (
        <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl font-bold z-50 animate-in fade-in slide-in-from-top-4">
          ✅ {toastMsg}
        </div>
      )}

      {/* Mobile Admin Header */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-slate-900 text-white h-14 flex items-center justify-between px-6 z-20 shadow-lg">
        <h2 className="text-lg font-black text-secondary">Admin Dashboard</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="w-64 bg-slate-900 text-white h-full fixed left-0 top-16 bottom-0 shadow-xl z-10 hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Slide-out) */}
      <div className={`md:hidden fixed inset-0 top-16 bg-slate-900 text-white z-30 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4 md:p-6 overflow-y-auto pt-20 md:pt-6">
        <div className="max-w-6xl mx-auto">

          {loading && <div className="text-center py-4">Loading data...</div>}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-4">Add Product</h3>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Name" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="border p-2 rounded" />
                  <input type="number" placeholder="Price" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="border p-2 rounded" />
                  <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="border p-2 rounded">
                    <option>Men</option><option>Footwear</option><option>Accessories</option>
                  </select>
                  <input type="file" onChange={e => setProductForm({ ...productForm, images: e.target.files[0] })} className="border p-2 rounded" />
                  <textarea placeholder="Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="border p-2 rounded md:col-span-2" rows="2"></textarea>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Stock Quantity</label>
                    <input type="number" min="0" required value={productForm.quantity} onChange={e => setProductForm({ ...productForm, quantity: e.target.value })} className="border p-2 rounded bg-slate-50" />
                    <p className="text-[10px] text-slate-400">↓ OR define per-size stock below for precise inventory control</p>
                  </div>

                  {/* SIZES SECTION */}
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-black flex items-center gap-2">📐 Sizes & Stock (Optional)</h4>
                      <button type="button" onClick={addSizeRow} className="text-xs bg-secondary text-primary px-3 py-1 rounded-full font-bold hover:bg-amber-500">+ Add Size</button>
                    </div>

                    {productForm.sizes.length > 0 && (
                      <div className="overflow-x-auto mb-4 border rounded-xl bg-slate-50 p-2">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b text-slate-500">
                              <th className="p-2">Size (e.g. M, 8)</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Qty</th>
                              <th className="p-2">Price +/-</th>
                              <th className="p-2">Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productForm.sizes.map((s, idx) => (
                              <tr key={idx} className="border-b last:border-0">
                                <td className="p-1">
                                  <input type="text" value={s.label} onChange={e => updateSizeRow(idx, 'label', e.target.value)} className="w-full border p-1 rounded" placeholder="M" />
                                </td>
                                <td className="p-1">
                                  <select value={s.sizeType} onChange={e => updateSizeRow(idx, 'sizeType', e.target.value)} className="w-full border p-1 rounded">
                                    <option>Clothing</option>
                                    <option>Footwear</option>
                                    <option>Custom</option>
                                  </select>
                                </td>
                                <td className="p-1">
                                  <input type="number" min="0" value={s.quantity} onChange={e => updateSizeRow(idx, 'quantity', e.target.value)} className="w-full border p-1 rounded" />
                                </td>
                                <td className="p-1">
                                  <input type="number" value={s.priceAdjust} onChange={e => updateSizeRow(idx, 'priceAdjust', e.target.value)} className="w-full border p-1 rounded" placeholder="+50" />
                                </td>
                                <td className="p-1 text-center">
                                  <button type="button" onClick={() => removeSizeRow(idx)} className="text-red-500 font-bold hover:scale-110">✕</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-2 text-right font-bold text-slate-600 px-2">
                          Total Stock from sizes: {productForm.quantity} units
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BULK DISCOUNT SECTION */}
                  <div className="md:col-span-2 border-t pt-4">
                    <h4 className="text-sm font-black mb-3 flex items-center gap-2">🎁 Bulk Discount (Optional)</h4>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Buy</span>
                        <input type="number" placeholder="2" value={productForm.bulkDiscount.minQty} onChange={e => setProductForm({...productForm, bulkDiscount: {...productForm.bulkDiscount, minQty: e.target.value}})} className="w-16 border p-1 rounded text-center" />
                        <span className="text-xs font-bold text-slate-500">or more → get</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="5" value={productForm.bulkDiscount.discountPct} onChange={e => setProductForm({...productForm, bulkDiscount: {...productForm.bulkDiscount, discountPct: e.target.value}})} className="w-16 border p-1 rounded text-center" />
                        <span className="text-xs font-bold text-slate-500">% off</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">Example: Buy 2 or more → get 5% off. Leave blank to disable.</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Est. Delivery (days)</label>
                    <input type="number" min="1" max="30" required value={productForm.deliveryDays} onChange={e => setProductForm({ ...productForm, deliveryDays: e.target.value })} className="border p-2 rounded" />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Applicable Offer (optional)</label>
                    <select value={productForm.appliedOffer} onChange={e => setProductForm({ ...productForm, appliedOffer: e.target.value })} className="border p-2 rounded">
                      <option value="">-- No Offer --</option>
                      {offers.filter(o => o.isActive).map(o => (
                        <option key={o._id} value={o._id}>{o.emoji} {o.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4 items-center">
                    <label><input type="checkbox" checked={productForm.inStock} onChange={e => setProductForm({ ...productForm, inStock: e.target.checked })} /> In Stock</label>
                    <label><input type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })} /> Featured (Fresh Arrivals)</label>
                  </div>
                  <button type="submit" className="bg-primary text-white py-2 rounded-lg font-bold md:col-span-2">Save Product</button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b"><tr><th className="p-4">Image</th><th className="p-4">Name</th><th className="p-4">Price</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No products available. Add your first product above.</td></tr>
                    ) : products.map(p => (
                      <tr key={p._id} className="border-b">
                        <td className="p-4"><img src={p.imageUrl} alt="" className="w-12 h-12 rounded object-cover" /></td>
                        <td className="p-4 font-bold">{p.name} {p.isFeatured && '⭐'}</td>
                        <td className="p-4">₹{p.price}</td>
                        <td className="p-4">{p.category}</td>
                        <td className="p-4">
                          {p.quantity === 0 ? <span className="text-red-500 font-bold">Out of Stock</span> :
                            p.quantity <= (p.lowStockThreshold || 5) ? <span className="text-orange-500 font-bold">⚠️ Low ({p.quantity})</span> :
                              <span className="text-green-500">In Stock ({p.quantity})</span>}
                        </td>
                        <td className="p-4"><button onClick={() => deleteProduct(p._id)} className="text-red-500 hover:underline">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: OFFERS */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-4">Add Offer Banner</h3>
                <form onSubmit={handleOfferSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Title" required value={offerForm.title} onChange={e => setOfferForm({ ...offerForm, title: e.target.value })} className="border p-2 rounded" />
                  <input type="text" placeholder="Emoji (e.g. 🎊)" value={offerForm.emoji} onChange={e => setOfferForm({ ...offerForm, emoji: e.target.value })} className="border p-2 rounded" />
                  <input type="text" placeholder="Tagline" value={offerForm.tagline} onChange={e => setOfferForm({ ...offerForm, tagline: e.target.value })} className="border p-2 rounded" />
                  <input type="number" placeholder="Discount %" required value={offerForm.discount} onChange={e => setOfferForm({ ...offerForm, discount: e.target.value })} className="border p-2 rounded" />
                  <select value={offerForm.category} onChange={e => setOfferForm({ ...offerForm, category: e.target.value })} className="border p-2 rounded">
                    <option>All</option><option>Men</option><option>Footwear</option><option>Accessories</option>
                  </select>
                  <input type="color" value={offerForm.bannerColor} onChange={e => setOfferForm({ ...offerForm, bannerColor: e.target.value })} className="border p-1 rounded h-10 w-full" />
                  <button type="submit" className="bg-primary text-white py-2 rounded-lg font-bold md:col-span-3">Save Offer</button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b"><tr><th className="p-4">Offer</th><th className="p-4">Discount</th><th className="p-4">Category</th><th className="p-4">Color</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                  <tbody>
                    {offers.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No active offers. Create one above to boost sales.</td></tr>
                    ) : offers.map(o => (
                      <tr key={o._id} className="border-b">
                        <td className="p-4 font-bold">{o.emoji} {o.title} <br /><span className="text-xs font-normal text-slate-500">{o.tagline}</span></td>
                        <td className="p-4">{o.discount}%</td>
                        <td className="p-4">{o.category}</td>
                        <td className="p-4"><div className="w-6 h-6 rounded-full" style={{ backgroundColor: o.bannerColor }}></div></td>
                        <td className="p-4"><button onClick={() => toggleOffer(o._id)} className={o.isActive ? 'text-green-500' : 'text-slate-400'}>{o.isActive ? 'Active' : 'Inactive'}</button></td>
                        <td className="p-4"><button onClick={() => deleteOffer(o._id)} className="text-red-500 hover:underline">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b"><h3 className="text-xl font-bold">All Orders</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4">ID / Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items / Price</th>
                      <th className="p-4">Shipping Address</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No orders yet.</td></tr>
                    ) : orders.map(o => (
                      <tr key={o._id}>
                        <td className="p-4 text-xs">
                          <span className="font-mono bg-slate-100 p-1 rounded">#{o._id.slice(-6)}</span><br />
                          <span className="text-slate-500 mt-1 block">{new Date(o.createdAt).toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-primary">{o.customerName}</span><br />
                          <span className="text-xs text-slate-500 font-medium">{o.customerPhone}</span><br />
                          <span className="text-[10px] text-slate-400">{o.customerEmail}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold">{o.productName}</span><br />
                          <div className="flex gap-2 mt-1">
                             <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold">Size: {o.selectedSize || 'N/A'}</span>
                             <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold">Qty: {o.quantity || 1}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900 mt-1 block">₹{o.productPrice}</span>
                        </td>
                        <td className="p-4 text-xs leading-relaxed">
                          <p className="max-w-[180px] break-words">{o.address}</p>
                          <span className="font-bold text-slate-600 uppercase text-[10px]">{o.city}, {o.district} - {o.pincode}</span>
                        </td>
                        <td className="p-4 text-xs">
                          <span className="uppercase font-bold">{o.paymentMethod}</span><br />
                        {o.paymentMethod === 'upi' && o.paymentScreenshotUrl ? (
                          <a href={o.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View Proof</a>
                        ) : (
                          <span className="text-green-500">Paid Online</span>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                          className="border p-1 rounded text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Pending */}
              <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
                <div className="p-6 border-b bg-yellow-50"><h3 className="text-xl font-bold text-yellow-800">Pending Approvals</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.pending.length === 0 && <p className="text-slate-500">No pending reviews.</p>}
                  {reviews.pending.map(r => (
                    <div key={r._id} className="border p-4 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">{r.customerName}</span>
                        <span className="text-secondary">{'⭐'.repeat(r.rating)}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">"{r.reviewText}"</p>
                      <div className="flex gap-2">
                        <button onClick={() => approveReview(r._id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">Approve</button>
                        <button onClick={() => deleteReview(r._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Approved */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b"><h3 className="text-xl font-bold">Approved Reviews</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reviews.approved.length === 0 && <p className="text-slate-500 md:col-span-3">No approved reviews yet.</p>}
                  {reviews.approved.map(r => (
                    <div key={r._id} className="border p-4 rounded-xl bg-slate-50">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">{r.customerName}</span>
                        <span className="text-secondary">{'⭐'.repeat(r.rating)}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">"{r.reviewText}"</p>
                      <button onClick={() => deleteReview(r._id)} className="text-red-500 text-sm hover:underline">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: APPEARANCE */}
          {activeTab === 'appearance' && (
            <form onSubmit={handleSettingsSubmit} className="space-y-6 pb-20">

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm sticky top-0 z-10 border border-slate-200">
                <h2 className="text-xl font-bold">Store Appearance Settings</h2>
                <button type="submit" className="bg-secondary text-primary px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-500"><Save size={18} /> Save All Changes</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                  <h3 className="text-lg font-bold border-b pb-2">Branding & Contact</h3>

                  <div>
                    <label className="block text-sm font-bold mb-1">Custom Logo Image (Optional)</label>
                    <input type="file" onChange={e => setSettingsFiles({ ...settingsFiles, logoImage: e.target.files[0] })} className="w-full border p-2 rounded text-sm" />
                    {settings.logoUrl && <img src={settings.logoUrl} className="h-10 mt-2 object-contain" alt="Current Logo" />}
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">Footer Tagline</label>
                    <textarea value={settingsForm.footerTagline} onChange={e => setSettingsForm({ ...settingsForm, footerTagline: e.target.value })} className="w-full border p-2 rounded" rows="2"></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">Contact Email</label>
                    <input type="email" value={settingsForm.contactEmail} onChange={e => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })} className="w-full border p-2 rounded" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">Instagram URL</label>
                    <input type="text" value={settingsForm.instagramUrl} onChange={e => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })} className="w-full border p-2 rounded" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">Facebook URL</label>
                    <input type="text" value={settingsForm.facebookUrl} onChange={e => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })} className="w-full border p-2 rounded" />
                  </div>
                </div>

                {/* Payment Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                  <h3 className="text-lg font-bold border-b pb-2">Payment Details</h3>

                  <div>
                    <label className="block text-sm font-bold mb-1">UPI ID</label>
                    <input type="text" value={settingsForm.upiId} onChange={e => setSettingsForm({ ...settingsForm, upiId: e.target.value })} className="w-full border p-2 rounded font-mono" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">UPI QR Code Image</label>
                    <input type="file" onChange={e => setSettingsFiles({ ...settingsFiles, upiQrCode: e.target.files[0] })} className="w-full border p-2 rounded text-sm" />
                    {settings.upiQrCodeUrl && <img src={settings.upiQrCodeUrl} className="h-32 mt-2 object-contain border rounded p-1" alt="Current QR" />}
                  </div>
                </div>

                {/* Category Images */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 lg:col-span-2">
                  <h3 className="text-lg font-bold border-b pb-2">Category Showcase Images (URLs)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Men Image URL</label>
                      <input type="text" value={settingsForm.catMen} onChange={e => setSettingsForm({ ...settingsForm, catMen: e.target.value })} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Footwear Image URL</label>
                      <input type="text" value={settingsForm.catFootwear} onChange={e => setSettingsForm({ ...settingsForm, catFootwear: e.target.value })} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Accessories Image URL</label>
                      <input type="text" value={settingsForm.catAccessories} onChange={e => setSettingsForm({ ...settingsForm, catAccessories: e.target.value })} className="w-full border p-2 rounded" />
                    </div>
                  </div>
                </div>

                {/* Hero Slides */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-lg font-bold">Hero Slides</h3>
                    <button type="button" onClick={addHeroSlide} className="text-sm bg-slate-900 text-white px-3 py-1 rounded hover:bg-slate-800">+ Add Slide</button>
                  </div>

                  <div className="space-y-4">
                    {heroSlides.length === 0 && <p className="text-slate-500 text-sm italic">No slides added. Default hero will show.</p>}
                    {heroSlides.map((slide, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50 relative group">
                        <button type="button" onClick={() => removeSlide(index)} className="absolute top-2 right-2 text-red-500 text-xs font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase">Image URL *</label>
                          <input type="text" value={slide.imageUrl} onChange={e => updateSlide(index, 'imageUrl', e.target.value)} className="w-full border p-2 rounded mt-1" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase">Title *</label>
                          <input type="text" value={slide.title} onChange={e => updateSlide(index, 'title', e.target.value)} className="w-full border p-2 rounded mt-1" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase">Subtitle</label>
                          <input type="text" value={slide.subtitle} onChange={e => updateSlide(index, 'subtitle', e.target.value)} className="w-full border p-2 rounded mt-1" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase">Button Text</label>
                          <input type="text" value={slide.buttonText} onChange={e => updateSlide(index, 'buttonText', e.target.value)} className="w-full border p-2 rounded mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
