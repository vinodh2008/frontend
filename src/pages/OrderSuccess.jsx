import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Star, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const productId = searchParams.get('productId');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/reviews`, {
        orderId,
        customerName,
        customerPhone,
        rating,
        reviewText
      });
      setReviewSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen text-center">
        <h1 className="text-2xl font-bold">Invalid Order</h1>
        <Link to="/" className="text-secondary mt-4 inline-block hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
      <div className="max-w-2xl w-full">
        
        {/* Success Card */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 text-center mb-8">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Order Placed!</h1>
          <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
            Thank you for shopping with us. Rajesh will confirm your order shortly via WhatsApp.
          </p>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl inline-block mb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Order Tracking ID</span>
            <span className="font-mono text-slate-900 font-bold select-all">{orderId}</span>
          </div>
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
              <ArrowLeft size={18} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Review Form */}
        {!reviewSubmitted ? (
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Leave a Review</h3>
            <p className="text-slate-500 mb-6">How was your experience with this product?</p>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex gap-2 justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={40} 
                      className={`${(hoverRating || rating) >= star ? 'text-secondary fill-secondary' : 'text-slate-300'} transition-colors`} 
                    />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                  <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Review</label>
                <textarea required rows="3" value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="w-full border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary" placeholder="Tell others what you think..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || rating === 0}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-secondary hover:text-primary disabled:bg-slate-300 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-green-600 mb-2">Thank You! 🎉</h3>
            <p className="text-green-700">Your review has been submitted and is awaiting approval.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderSuccess;
