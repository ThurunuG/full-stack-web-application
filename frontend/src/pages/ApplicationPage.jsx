import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const ApplicationPage = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'MALE',
    mobileNumber: '',
    address: '',
    feedback: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Customer's previous submissions history
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchMySubmissions = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/submissions/my');
      setMySubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Failed to load submissions history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await api.post('/submissions', formData);
      setSuccess(true);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        gender: 'MALE',
        mobileNumber: '',
        address: '',
        feedback: '',
      });
      // Refresh customer's submission history
      fetchMySubmissions();
    } catch (err) {
      console.error('Submission failed:', err);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e) => e.message).join(' • '));
      } else {
        setError(err.response?.data?.message || 'Failed to submit application. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Customer Submission Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Application Form
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete the form below to register your application. All entries are securely audited and stored.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <span>Applicant Information</span>
            </h2>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl mb-5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Your application was submitted successfully! It is now listed below.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Submission Email * (must be unique per submission)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {/* Gender Radio Group */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                    <label
                      key={g}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        formData.gender === g
                          ? 'border-sky-600 bg-sky-50/70 text-sky-700 ring-2 ring-sky-500/20'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span>{g.charAt(0) + g.slice(1).toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number * (valid local phone format)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    placeholder="+1 555-019-2831"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="123 Orchard Road, Suite 400"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {/* Feedback (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Feedback (Optional)
                </label>
                <div className="relative">
                  <textarea
                    name="feedback"
                    rows="3"
                    placeholder="Share any additional comments or questions..."
                    value={formData.feedback}
                    onChange={handleChange}
                    className="w-full p-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  ></textarea>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting Application...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>My Submitted Applications</span>
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                {mySubmissions.length}
              </span>
            </div>

            {loadingHistory ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
            ) : mySubmissions.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 font-medium">No applications submitted yet.</p>
                <p className="text-[11px] text-slate-400">Your submitted records will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {mySubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl hover:border-slate-300 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {sub.firstName} {sub.lastName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.gender === 'FEMALE'
                            ? 'bg-pink-100 text-pink-700'
                            : sub.gender === 'MALE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {sub.gender}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p className="truncate">Email: <span className="text-slate-700">{sub.email}</span></p>
                      <p>Phone: <span className="text-slate-700">{sub.mobileNumber}</span></p>
                      <p className="truncate">Address: <span className="text-slate-700">{sub.address}</span></p>
                      {sub.feedback && (
                        <p className="italic text-slate-600 bg-white p-2 rounded-lg border border-slate-100 mt-1">
                          "{sub.feedback}"
                        </p>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Submitted: {new Date(sub.dateCreated).toLocaleDateString()}</span>
                      {sub.dateModified && (
                        <span className="text-amber-600 font-medium">Modified by Admin</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
