import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Clock, ArrowRight, Star, ShoppingBag, Zap, Eye, Play } from 'lucide-react';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

const API_URL = 'https://backend-9wpf.onrender.com/api';


// --- FLIP CARD COMPONENT ---
const FlipCard = ({ product, getOfferForProduct, onQuickView }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const videoRef = React.useRef(null);
  const activeOffer = getOfferForProduct(product);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) videoRef.current.play().catch(() => { });
          else videoRef.current.pause();
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTouch = () => {
    if ('ontouchstart' in window) setIsFlipped(!isFlipped);
  };

  const finalPrice = product.finalPrice || product.price;

  return (
    <div
      className="perspective-1000 w-full h-[420px] group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={handleTouch}
    >
      <motion.div
        className="relative w-full h-full transition-all duration-700 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden rounded-[32px] overflow-hidden shadow-lg bg-slate-100">
          {product.videoUrl ? (
            <video
              ref={videoRef}
              src={product.videoUrl}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={product.imageUrl || product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {activeOffer && (
              <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg">
                {activeOffer.discount}% OFF
              </span>
            )}
            {product.videoUrl && (
              <span className="bg-black/50 backdrop-blur text-white p-1.5 rounded-full">
                <Play size={12} fill="currentColor" />
              </span>
            )}
          </div>

          {product.quantity > 0 && product.quantity < 5 && (
            <div className="absolute top-4 right-4 bg-amber-500 text-primary text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg">
              🔥 ONLY {product.quantity} LEFT
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-white font-black text-xl leading-tight line-clamp-1">{product.name}</h3>
            <p className="text-secondary font-bold text-lg mt-1">₹{finalPrice}</p>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden rounded-[32px] overflow-hidden shadow-2xl bg-slate-900 border-2 border-secondary/20 flex flex-col p-8 rotate-y-180">
          <div className="flex-grow">
            <span className="text-secondary font-black text-[10px] uppercase tracking-widest block mb-2">{product.category}</span>
            <h3 className="text-white font-black text-2xl mb-4 line-clamp-2">{product.name}</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white">₹{finalPrice}</span>
                {activeOffer && <span className="text-slate-500 line-through text-sm">₹{product.price}</span>}
              </div>

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-widest">Available Sizes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.filter(s => s.quantity > 0).map((s, idx) => (
                      <span key={idx} className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10">
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-bold text-slate-300">
                  {product.quantity > 0 ? `${product.quantity} units in stock` : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
            >
              <Eye size={18} /> Quick View
            </button>
            <Link
              to={`/product/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-secondary text-primary py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white transition-colors"
            >
              <ShoppingBag size={18} /> Order Now
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Homepage = ({ settings }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const categoryFilter = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await axios.get(`${API_URL}/products`);
        setProducts(prodRes.data);

        const offerRes = await axios.get(`${API_URL}/offers/active`);
        setOffers(offerRes.data);

        const revRes = await axios.get(`${API_URL}/reviews/approved`);
        setReviews(revRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Hero Slider Logic
  const slides = settings?.heroSlides?.length > 0 ? settings.heroSlides : [
    {
      imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&q=80&w=2000',
      title: 'Kakinada Rajesh Fashion Store',
      subtitle: 'Define your style with premium menswear, elite footwear, and curated accessories.',
      buttonText: 'Shop Collection'
    }
  ];

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  // Fresh Arrivals Logic
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let freshArrivals = products.filter(p => p.isFeatured || new Date(p.createdAt) > sevenDaysAgo);
  if (freshArrivals.length === 0) {
    // If no recent or featured, take newest 6
    freshArrivals = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  } else {
    freshArrivals = freshArrivals.slice(0, 8); // Max 8
  }

  // Filter Grid Products
  const gridProducts = products.filter(p => {
    if (categoryFilter !== 'all' && p.category.toLowerCase() !== categoryFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getOfferForProduct = (product) => {
    if (product.appliedOffer) return product.appliedOffer;
    return offers.find(o => o.category.toLowerCase() === product.category.toLowerCase() || o.category.toLowerCase() === 'all');
  };

  return (
    <div className="bg-slate-50 min-h-screen">

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          settings={settings}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* SECTION 1: HERO BANNER (Auto-Sliding) */}
      <section className="relative h-[85vh] lg:h-[90vh] overflow-hidden bg-slate-900 pt-[104px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={slides[heroIndex].imageUrl}
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto">
          <motion.h1
            key={`title-${heroIndex}`}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tighter leading-tight"
          >
            {slides[heroIndex].title}
          </motion.h1>
          <motion.p
            key={`subtitle-${heroIndex}`}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl"
          >
            {slides[heroIndex].subtitle}
          </motion.p>
          <motion.div
            key={`btn-${heroIndex}`}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => {
                document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-secondary text-primary px-8 py-4 rounded-full font-black text-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              {slides[heroIndex].buttonText} <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>

        {/* Slider Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === heroIndex ? 'bg-secondary w-8' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: OFFERS SCROLLING BANNER */}
      {offers.length > 0 && (
        <div className="bg-white py-6 border-b border-slate-200 overflow-hidden relative">
          <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-6 px-4">
            {[...offers, ...offers, ...offers].map((offer, idx) => (
              <div
                key={`${offer._id}-${idx}`}
                className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl shrink-0 shadow-sm border border-black/5"
                style={{ backgroundColor: offer.bannerColor || '#F59E0B', color: '#fff' }}
              >
                <span className="text-3xl">{offer.emoji}</span>
                <div>
                  <h3 className="font-black text-lg">{offer.title}</h3>
                  {offer.tagline && <p className="text-sm font-medium opacity-90">{offer.tagline}</p>}
                  {offer.validTill && <p className="text-[10px] uppercase tracking-wider opacity-80 mt-1">Valid till {new Date(offer.validTill).toLocaleDateString()}</p>}
                </div>
                <span className="ml-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm">
                  {offer.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CATEGORY SHOWCASE */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Men', 'Footwear', 'Accessories'].map((cat) => {
            const bgImage = settings?.categoryImages?.[cat.toLowerCase()] || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80';
            return (
              <Link
                key={cat}
                to={`/?category=${cat.toLowerCase()}`}
                className="group relative h-96 rounded-3xl overflow-hidden shadow-lg block"
              >
                <img src={bgImage} alt={cat} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <h3 className="text-3xl font-black text-white">{cat}</h3>
                  <span className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center group-hover:bg-secondary group-hover:text-primary transition-colors">
                    <ArrowRight size={24} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* SECTION 4: FRESH ARRIVALS */}
      {freshArrivals.length > 0 && (
        <section id="fresh-arrivals" className="py-20 bg-white border-y border-slate-100 overflow-hidden">
          <div className="container mx-auto px-4 mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                <span className="text-secondary">FRESH</span> <span className="text-slate-900">ARRIVALS</span>
              </h2>
              <p className="text-slate-500 font-medium mt-2">Latest additions for Men's Fashion</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400">
                ←
              </button>
              <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-900 font-bold">
                →
              </button>
            </div>
          </div>

          <div className="flex gap-8 overflow-x-auto px-4 container mx-auto pb-12 hide-scrollbar scroll-smooth snap-x">
            {freshArrivals.map(product => (
              <div key={product._id} className="min-w-[320px] w-[320px] shrink-0 snap-start">
                <FlipCard
                  product={product}
                  getOfferForProduct={getOfferForProduct}
                  onQuickView={setQuickViewProduct}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: FULL PRODUCT GRID */}
      <section id="collection" className="py-20 container mx-auto px-4 min-h-screen">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
            <span className="text-secondary">OUR</span> <span className="text-slate-900">COLLECTION</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            {['All', 'Men', 'Footwear', 'Accessories'].map(tab => (
              <button
                key={tab}
                onClick={() => setSearchParams(tab === 'All' ? {} : { category: tab.toLowerCase() })}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${(categoryFilter === tab.toLowerCase() || (tab === 'All' && categoryFilter === 'all'))
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {gridProducts.length > 0 ? gridProducts.map(product => (
            <div key={product._id} className="flex flex-col">
              <FlipCard
                product={product}
                getOfferForProduct={getOfferForProduct}
                onQuickView={setQuickViewProduct}
              />
            </div>
          )) : (
            <div className="col-span-full py-20 text-center text-slate-500">
              No products found in this category.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 6: HAPPY CUSTOMERS */}
      {reviews.length > 0 && (
        <section className="py-24 bg-slate-100 overflow-hidden">
          <div className="container mx-auto px-4 mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              <span className="text-secondary">HAPPY</span> <span className="text-slate-900">CUSTOMERS</span>
            </h2>
            <p className="text-slate-500 font-medium mt-4">Real reviews from our valued customers</p>
          </div>

          <div className="flex gap-6 overflow-x-auto px-4 container mx-auto pb-8 hide-scrollbar snap-x">
            {reviews.map(review => (
              <div key={review._id} className="min-w-[320px] w-[400px] max-w-[80vw] shrink-0 snap-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-full flex items-center justify-center font-black text-xl">
                      {review.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{review.customerName}</h4>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                        Verified Purchase ✅
                      </span>
                    </div>
                  </div>
                  <div className="flex text-secondary">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">"{review.reviewText}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 7: VISIT OUR STORE */}
      <section id="visit-us" className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Visit Our Store</h2>
            <div className="w-24 h-2 bg-secondary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Kakinada Branch */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-slate-300 transition-all">
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-slate-900 text-white shrink-0 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Kakinada Main Branch</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-6">
                    53, Road No.1, Maruti Nagar,<br />Ramanayyapeta, Kakinada - 533005
                  </p>
                  <a href="tel:9993822286" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl font-bold hover:border-secondary transition-all">
                    <Phone size={18} /> 9993822286
                  </a>
                </div>
              </div>
            </div>

            {/* Tuni Branch */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-slate-300 transition-all">
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-secondary text-primary shrink-0 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Tuni Showroom</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-6">
                    Main Road, Near Cinema Hall,<br />Tuni, Andhra Pradesh - 533401
                  </p>
                  <a href="tel:9281425686" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl font-bold hover:border-secondary transition-all">
                    <Phone size={18} /> 9281425686
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global CSS for Marquee & Flip Cards */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Homepage;
