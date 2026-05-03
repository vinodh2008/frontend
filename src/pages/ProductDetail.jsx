import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, CreditCard, UploadCloud, CheckCircle, X, Minus, Plus, Play, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'https://backend-9wpf.onrender.com/api';


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeOffer, setActiveOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gallery State
  const [activeMedia, setActiveMedia] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  // Selection State
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    city: '',
    district: '',
    pincode: '',
    paymentMethod: 'upi',
    transactionId: ''
  });
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mockRazorpayId, setMockRazorpayId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await axios.get(`${API_URL}/products/${id}`);
        const found = prodRes.data;
        setProduct(found);
        setActiveMedia(found.thumbnailUrl || found.images?.[0] || found.imageUrl);
        if (found.videoUrl) setIsVideoActive(true);

        // Auto-select first in-stock size
        if (found.sizes && found.sizes.length > 0) {
          const firstInStock = found.sizes.find(s => s.quantity > 0);
          if (firstInStock) setSelectedSize(firstInStock);
        }

        const offerRes = await axios.get(`${API_URL}/offers/active`);
        const offer = found.appliedOffer || offerRes.data.find(o => o.category.toLowerCase() === found.category.toLowerCase() || o.category.toLowerCase() === 'all');
        setActiveOffer(offer);

        const settingsRes = await axios.get(`${API_URL}/settings`);
        setSettings(settingsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMockRazorpay = () => {
    alert("Payment Successful ✅ (Mock Razorpay)");
    setMockRazorpayId('pay_' + Math.random().toString(36).substr(2, 9));
    setFormData({ ...formData, paymentMethod: 'razorpay' });
  };

  // Pricing Logic
  const basePrice = product?.finalPrice || product?.price || 0;
  const unitPrice = basePrice + (selectedSize?.priceAdjust || 0);
  let totalPrice = unitPrice * qty;
  let hasBulkDiscount = false;
  let discountAmount = 0;

  if (product?.bulkDiscount?.minQty > 0 && qty >= product.bulkDiscount.minQty) {
    hasBulkDiscount = true;
    discountAmount = (totalPrice * product.bulkDiscount.discountPct) / 100;
    totalPrice -= discountAmount;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.paymentMethod === 'upi' && !paymentScreenshot) {
      alert("Please upload payment screenshot for UPI.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('productId', product._id);
      submitData.append('productName', product.name);
      submitData.append('productPrice', Math.round(totalPrice));
      submitData.append('productCategory', product.category);
      submitData.append('selectedSize', selectedSize?.label || 'N/A');
      submitData.append('quantity', qty);

      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      submitData.append('state', 'Andhra Pradesh');

      if (formData.paymentMethod === 'upi') {
        submitData.append('paymentScreenshot', paymentScreenshot);
      } else {
        submitData.append('razorpayPaymentId', mockRazorpayId);
      }

      const res = await axios.post(`${API_URL}/orders`, submitData);

      // WhatsApp Logic
      const waNumber = settings?.upiId ? '9993822286' : '9993822286';
      const waMessage = `🛍️ NEW ORDER — Kakinada Rajesh Fashion Store\n\n👤 Customer: ${formData.customerName}\n📞 Phone: ${formData.customerPhone}\n📧 Email: ${formData.customerEmail}\n\n🛒 Product: ${product.name}\n📏 Size: ${selectedSize?.label || 'N/A'}\n🔢 Quantity: ${qty}\n💰 Total Price: ₹${Math.round(totalPrice)}\n📂 Category: ${product.category}\n\n📍 Delivery Address:\n${formData.address}\n${formData.city}, ${formData.district} - ${formData.pincode}\nAndhra Pradesh\n\n💳 Payment Method: ${formData.paymentMethod.toUpperCase()}\n🔖 Transaction ID: ${formData.transactionId || mockRazorpayId}\n✅ Status: Payment Info Uploaded\n\nPlease confirm this order! 🙏`;

      const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, '_blank');

      navigate(`/order-success?orderId=${res.data._id}&productId=${product._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="pt-32 min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="pt-32 min-h-screen text-center">Product not found.</div>;

  const getDeliveryDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + (days || 3));
    return d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const allImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl || product.thumbnailUrl];

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button className="absolute top-10 right-10 text-white"><X size={40} /></button>
            <img src={activeMedia} className="max-w-full max-h-full object-contain" alt="" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">

        {/* LEFT SIDE: Media Gallery */}
        <div className="lg:w-[48%]">
          <div className="sticky top-32 space-y-4">
            {/* Main Viewer */}
            <div className="rounded-[40px] overflow-hidden bg-slate-100 aspect-[4/5] relative group shadow-2xl">
              {isVideoActive && product.videoUrl ? (
                <video src={product.videoUrl} autoPlay muted loop playsInline controls className="w-full h-full object-cover" />
              ) : (
                <img
                  src={activeMedia}
                  alt={product.name}
                  onClick={() => setShowLightbox(true)}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-105"
                />
              )}
              {activeOffer && (
                <span className="absolute top-8 left-8 bg-red-500 text-white text-xs font-black px-4 py-2 rounded-full uppercase shadow-xl">
                  🏷️ SALE {activeOffer.discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {product.videoUrl && (
                <button
                  onClick={() => setIsVideoActive(true)}
                  className={`min-w-[80px] h-[100px] rounded-2xl border-2 overflow-hidden bg-slate-900 flex items-center justify-center transition-all ${isVideoActive ? 'border-secondary scale-105 shadow-lg' : 'border-transparent opacity-60'}`}
                >
                  <Play size={32} className="text-secondary fill-secondary" />
                </button>
              )}
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveMedia(img); setIsVideoActive(false); }}
                  className={`min-w-[80px] h-[100px] rounded-2xl border-2 overflow-hidden transition-all ${!isVideoActive && activeMedia === img ? 'border-secondary scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Description & Details */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mt-8">
              <h3 className="text-xl font-black mb-4">Product Description</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                {product.description || "Premium quality product from Kakinada Rajesh Fashion Store. Handpicked with care to ensure the best fit and style for your wardrobe."}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</div>
                  <div className="font-bold text-slate-900">{product.category}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Return Policy</div>
                  <div className="font-bold text-slate-900">7 Days Easy Return</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Selection & Checkout */}
        <div className="lg:w-[52%]">
          <div className="space-y-8">
            {/* Header Info */}
            <div>
              <span className="text-secondary font-black text-sm uppercase tracking-[0.2em] block mb-2">{product.category}</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-slate-900">₹{basePrice}</span>
                {product.appliedOfferDiscount > 0 && (
                  <span className="text-xl text-slate-400 line-through">₹{product.price}</span>
                )}
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">In Stock</span>
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900">Select Your Size</h3>
                  <button className="text-xs font-bold text-secondary hover:underline underline-offset-4">Size Chart Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s, i) => (
                    <button
                      key={i}
                      disabled={s.quantity <= 0}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[60px] h-[60px] flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${selectedSize?.label === s.label
                        ? 'border-secondary bg-secondary/5 text-slate-900 scale-105 shadow-md shadow-secondary/10'
                        : s.quantity <= 0
                          ? 'border-slate-100 text-slate-300 line-through opacity-50 cursor-not-allowed'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                    >
                      <span className="font-black text-lg">{s.label}</span>
                      {s.priceAdjust !== 0 && (
                        <span className="text-[10px] font-bold">
                          {s.priceAdjust > 0 ? `+₹${s.priceAdjust}` : `-₹${Math.abs(s.priceAdjust)}`}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {selectedSize.quantity} units available for this size
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Live Pricing */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex-grow">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Quantity</label>
                <div className="flex items-center gap-6 bg-slate-50 w-fit p-1.5 rounded-2xl border border-slate-100">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold hover:bg-slate-100">
                    <Minus size={20} />
                  </button>
                  <span className="text-2xl font-black min-w-[30px] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(selectedSize ? selectedSize.quantity : product.quantity, qty + 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold hover:bg-slate-100">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl min-w-[280px] flex flex-col justify-center">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Estimated Amount</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-secondary">₹{Math.round(totalPrice)}</span>
                  {hasBulkDiscount && (
                    <span className="text-lg text-slate-500 line-through">₹{Math.round(unitPrice * qty)}</span>
                  )}
                </div>
                {hasBulkDiscount && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-black">
                    <Zap size={14} fill="currentColor" /> {product.bulkDiscount.discountPct}% BULK SAVINGS APPLIED
                  </div>
                )}
              </div>
            </div>

            {/* Order Form Start */}
            <div className="bg-white p-8 md:p-12 rounded-[40px] border-2 border-slate-100 shadow-2xl">
              <h2 className="text-3xl font-black text-primary mb-8 flex items-center gap-3">
                <ShoppingBag className="text-secondary" /> Secure Checkout
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Details */}
                <div>
                  <h3 className="text-xl font-bold mb-4 border-b border-slate-100 pb-2">1. Delivery Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                      <input type="text" name="customerName" required value={formData.customerName} onChange={handleInputChange} className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp No. *</label>
                      <input type="tel" name="customerPhone" pattern="[0-9]{10}" title="Please enter exactly 10 digits" required value={formData.customerPhone} onChange={handleInputChange} className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                      <input type="email" name="customerEmail" required value={formData.customerEmail} onChange={handleInputChange} className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Address *</label>
                      <textarea name="address" required value={formData.address} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City *</label>
                      <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">District *</label>
                      <input type="text" name="district" required value={formData.district} onChange={handleInputChange} className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pincode *</label>
                      <input type="text" name="pincode" pattern="[0-9]{6}" title="Please enter exactly 6 digits" required value={formData.pincode} onChange={handleInputChange} className="w-full bg-slate-50 border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">State</label>
                      <input type="text" value="Andhra Pradesh" disabled className="w-full bg-slate-100 border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" />
                    </div>
                  </div>
                </div>

                {/* Step 2: Payment */}
                <div>
                  <h3 className="text-xl font-bold mb-4 border-b border-slate-100 pb-2">2. Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Option A: UPI */}
                    <div className={`border-2 rounded-2xl p-4 transition-all cursor-pointer ${formData.paymentMethod === 'upi' ? 'border-secondary bg-secondary/5' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}>
                      <div className="flex items-center gap-2 mb-4">
                        <input type="radio" checked={formData.paymentMethod === 'upi'} onChange={() => { }} className="text-secondary focus:ring-secondary" />
                        <span className="font-bold text-slate-900">UPI Payment</span>
                      </div>
                      {formData.paymentMethod === 'upi' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="bg-white p-2 rounded-xl border border-slate-200 inline-block">
                            {settings?.upiQrCodeUrl ? (
                              <img src={settings.upiQrCodeUrl} alt="UPI QR" className="w-32 h-32 object-contain" />
                            ) : (
                              <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-xs text-slate-400 text-center p-2 rounded-lg">No QR set</div>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-600">UPI ID: <span className="text-slate-900 select-all">{settings?.upiId || '9993822286@upi'}</span></p>
                          <p className="text-xs text-slate-500">Scan & pay, then upload screenshot below</p>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Transaction ID *</label>
                            <input type="text" name="transactionId" required={formData.paymentMethod === 'upi'} value={formData.transactionId} onChange={handleInputChange} className="w-full bg-white border-slate-200 rounded-lg text-sm p-2" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Upload Screenshot *</label>
                            <input type="file" required={formData.paymentMethod === 'upi'} onChange={(e) => setPaymentScreenshot(e.target.files[0])} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-secondary/10 file:text-primary hover:file:bg-secondary/20" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option B: Razorpay */}
                    <div className={`border-2 rounded-2xl p-4 transition-all cursor-pointer ${formData.paymentMethod === 'razorpay' ? 'border-secondary bg-secondary/5' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}>
                      <div className="flex items-center gap-2 mb-4">
                        <input type="radio" checked={formData.paymentMethod === 'razorpay'} onChange={() => { }} className="text-secondary focus:ring-secondary" />
                        <span className="font-bold text-slate-900">Pay Online</span>
                      </div>
                      {formData.paymentMethod === 'razorpay' && (
                        <div className="flex flex-col items-center justify-center py-6 animate-in fade-in slide-in-from-top-2 text-center">
                          {mockRazorpayId ? (
                            <div className="text-green-500 font-bold flex flex-col items-center gap-2">
                              <CheckCircle size={32} />
                              Payment Captured
                            </div>
                          ) : (
                            <>
                              <CreditCard size={32} className="text-slate-300 mb-3" />
                              <button type="button" onClick={handleMockRazorpay} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors">
                                Pay Securely Now
                              </button>
                              <p className="text-[10px] text-slate-400 mt-2 max-w-[200px]">Click to simulate Razorpay success.</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Step 3: Submit */}
                <div className="pt-6 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting || product.quantity === 0 || (formData.paymentMethod === 'razorpay' && !mockRazorpayId)}
                    className="w-full bg-secondary text-primary py-4 rounded-2xl font-black text-lg hover:bg-amber-500 disabled:bg-slate-300 disabled:text-slate-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-secondary/20"
                  >
                    {isSubmitting ? 'Processing...' : (product.quantity === 0 ? 'Out of Stock' : 'Confirm Order & WhatsApp Us')}
                  </button>
                  <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
                    Secure encrypted checkout
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
