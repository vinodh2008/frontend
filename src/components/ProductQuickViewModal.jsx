import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, MessageCircle, ExternalLink, Play, ShoppingBag } from 'lucide-react';

const ProductQuickViewModal = ({ product, settings, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImg(product.thumbnailUrl || product.images?.[0] || product.imageUrl);
      // Auto-select first available size
      if (product.sizes && product.sizes.length > 0) {
        const firstInStock = product.sizes.find(s => s.quantity > 0);
        if (firstInStock) setSelectedSize(firstInStock);
      }
    }
  }, [product]);

  if (!product) return null;

  const unitPrice = (product.finalPrice || product.price) + (selectedSize?.priceAdjust || 0);
  let totalPrice = unitPrice * qty;
  let hasBulkDiscount = false;
  let discountAmount = 0;

  if (product.bulkDiscount && product.bulkDiscount.minQty > 0 && qty >= product.bulkDiscount.minQty) {
    hasBulkDiscount = true;
    discountAmount = (totalPrice * product.bulkDiscount.discountPct) / 100;
    totalPrice -= discountAmount;
  }

  const handleOrderWhatsApp = () => {
    const waNumber = settings?.upiId ? '9993822286' : '9993822286';
    const message = `Hi! I want to order from Rajesh Fashion Store:
Product: ${product.name}
Size: ${selectedSize?.label || 'N/A'}
Quantity: ${qty}
Unit Price: ₹${unitPrice}
Total: ₹${Math.round(totalPrice)}
${hasBulkDiscount ? `(Bulk Discount Applied: ${product.bulkDiscount.discountPct}%)` : ''}
Please confirm availability.`;

    const url = `https://wa.me/91${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleNotifyWhatsApp = () => {
    const waNumber = settings?.upiId ? '9993822286' : '9993822286';
    const message = `Hi! Please notify me when ${product.name} in Size ${selectedSize?.label || ''} is back in stock.`;
    const url = `https://wa.me/91${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const allImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl || product.thumbnailUrl];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-5xl max-h-[90vh] md:h-auto rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/80 backdrop-blur shadow-lg p-2 rounded-full z-20 hover:scale-110 transition-transform"
          >
            <X size={20} className="text-slate-900" />
          </button>

          {/* Left: Gallery */}
          <div className="w-full md:w-[45%] h-[350px] md:h-auto bg-slate-50 flex flex-col relative">
            <div className="flex-grow relative overflow-hidden group">
              {isVideoActive && product.videoUrl ? (
                <video
                  src={product.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={activeImg}
                  alt={product.name}
                  onClick={() => setShowLightbox(true)}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
              )}
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.appliedOfferDiscount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    {product.appliedOfferDiscount}% OFF
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-secondary text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    New Arrival
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar bg-white/50 backdrop-blur-md border-t border-white/20">
              {product.videoUrl && (
                <button
                  onClick={() => setIsVideoActive(true)}
                  className={`min-w-[60px] h-[60px] rounded-xl border-2 transition-all flex items-center justify-center bg-slate-900 ${isVideoActive ? 'border-secondary scale-105' : 'border-transparent opacity-60'}`}
                >
                  <Play size={24} className="text-secondary fill-secondary" />
                </button>
              )}
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(img); setIsVideoActive(false); }}
                  className={`min-w-[60px] h-[60px] rounded-xl border-2 transition-all overflow-hidden ${!isVideoActive && activeImg === img ? 'border-secondary scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-[55%] p-6 md:p-10 overflow-y-auto custom-scrollbar">
            <span className="text-secondary font-black text-xs uppercase tracking-widest block mb-2">{product.category}</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{product.name}</h2>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black text-slate-900">₹{product.finalPrice || product.price}</span>
              {product.appliedOfferDiscount > 0 && (
                <span className="text-lg text-slate-400 line-through">₹{product.price}</span>
              )}
            </div>

            <div className="space-y-8">
              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Select Size</label>
                    <span className="text-[10px] font-bold text-slate-400">Inventory Control Applied</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s, i) => (
                      <button
                        key={i}
                        disabled={s.quantity <= 0}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                          selectedSize?.label === s.label
                            ? 'border-secondary bg-secondary/10 text-slate-900 scale-105'
                            : s.quantity <= 0
                              ? 'border-slate-100 text-slate-300 line-through cursor-not-allowed opacity-50'
                              : 'border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="mt-2 text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedSize.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      {selectedSize.quantity > 0 ? `${selectedSize.quantity} units available` : 'Currently Sold Out'}
                    </p>
                  )}
                </div>
              )}

              {/* Quantity & Price */}
              <div className="flex flex-col md:flex-row gap-6 md:items-end">
                <div className="flex-grow">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-3">Quantity</label>
                  <div className="flex items-center gap-4 bg-slate-50 w-fit p-1 rounded-2xl border border-slate-100">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-black text-lg">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(selectedSize ? selectedSize.quantity : (product.quantity || 1), qty + 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-[24px] min-w-[200px] shadow-xl shadow-slate-900/20">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</div>
                   <div className="flex items-baseline gap-2">
                     <span className="text-2xl font-black text-secondary">₹{Math.round(totalPrice)}</span>
                     {hasBulkDiscount && (
                       <span className="text-xs text-slate-400 line-through">₹{Math.round(unitPrice * qty)}</span>
                     )}
                   </div>
                   {hasBulkDiscount && (
                     <div className="text-[10px] font-bold text-green-400 mt-1 flex items-center gap-1">
                       <ShoppingBag size={10} /> {product.bulkDiscount.discountPct}% Bulk Discount Applied!
                     </div>
                   )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                {(!selectedSize || selectedSize.quantity > 0) ? (
                  <button
                    onClick={handleOrderWhatsApp}
                    className="w-full bg-secondary text-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-secondary/20 hover:bg-amber-500 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <MessageCircle size={22} className="fill-primary" /> Order on WhatsApp
                  </button>
                ) : (
                  <button
                    onClick={handleNotifyWhatsApp}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-slate-800 transition-all"
                  >
                    <MessageCircle size={22} /> Notify Me when Back in Stock
                  </button>
                )}
                
                <button
                  onClick={() => window.location.href = `/product/${product._id}`}
                  className="w-full bg-white text-slate-600 border-2 border-slate-100 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <ExternalLink size={16} /> View Full Product Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lightbox Overlay */}
        <AnimatePresence>
          {showLightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
              onClick={() => setShowLightbox(false)}
            >
              <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
                <X size={40} />
              </button>
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                src={activeImg}
                alt=""
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default ProductQuickViewModal;
