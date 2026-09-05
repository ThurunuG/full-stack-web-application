import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, User } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Keep the login fields together so they can be updated from one handler.
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    // Update only the field that the user is currently editing.
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
      // Authenticate the administrator through the admin-only endpoint.
      const res = await api.post('/auth/admin/login', formData);
      const { accessToken, refreshToken, user } = res.data;

      // Store the session in the auth context and redirect to the dashboard.
      login(accessToken, refreshToken, user);
      navigate('/admin/dashboard');
    } catch (err) {
      // Show the API error when available, otherwise use a safe fallback message.
      console.error('Admin login error:', err);
      setError(
        err.response?.data?.message || 'Failed to authenticate admin credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-900/5">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-purple-500/5 border border-purple-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Administrator Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Restricted access • Authorized personnel only
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl mb-5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                placeholder="admin@evotec.software"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Password *
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
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Populate the demo credentials for local or presentation use. */}
          <button
            type="button"
            onClick={() =>
              setFormData({ email: 'admin@evotec.software', password: 'Admin@12345' })
            }
            className="text-[11px] text-purple-600 hover:text-purple-700 font-medium underline block text-right"
          >
            Auto-fill demo admin
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Verifying Admin Privileges...' : 'Enter Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span>Looking for customer login? </span>
            <Link to="/login" className="font-bold hover:underline">
              Customer Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
