import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock } from 'lucide-react';

const API_URL = 'https://backend-9wpf.onrender.com/api';


const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/admin/login`, { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin-krfstore-2026/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-secondary text-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Admin Login</h2>
          <p className="text-sm text-slate-500 font-medium mt-2">Kakinada Rajesh Fashion Store</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all font-medium"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all font-medium"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400 mt-4"
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          🔐 This page is private. Do not share this URL.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
