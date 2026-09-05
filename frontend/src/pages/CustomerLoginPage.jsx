import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogIn, Mail, Lock, AlertCircle, Shield, ArrowRight } from 'lucide-react';

const CustomerLoginPage = () => {
  // Keep navigation and authentication concerns in the page component.
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Display a one-time message passed from the registration page.
  const registeredNotice = location.state?.message;

  const handleChange = (e) => {
    // Update only the field being edited while preserving the other value.
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Authenticate the customer and save the returned session credentials.
      const res = await api.post('/auth/customer/login', formData);
      const { accessToken, refreshToken, user } = res.data;

      // Store the authenticated user in the auth context and localStorage.
      login(accessToken, refreshToken, user);

      // Send authenticated customers to the application portal.
      navigate('/apply');
    } catch (err) {
      // Prefer the API error message, with a safe fallback for network errors.
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Failed to log in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Customer Login</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your application portal
          </p>
        </div>

        {registeredNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl mb-5">
            {registeredNotice}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl mb-5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Populate the form with the demo customer's credentials. */}
          <button
            type="button"
            onClick={() =>
              setFormData({ email: 'customer@example.com', password: 'Customer@123' })
            }
            className="text-[11px] text-sky-600 hover:text-sky-700 font-medium underline block text-right"
          >
            Auto-fill demo customer
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Customer'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-600 font-semibold hover:underline">
              Register now
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Are you an administrator? </span>
            <Link to="/admin/login" className="font-bold hover:underline">
              Admin Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
