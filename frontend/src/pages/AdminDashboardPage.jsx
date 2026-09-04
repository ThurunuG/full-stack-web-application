import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EditSubmissionModal from '../components/EditSubmissionModal';
import CreateAdminModal from '../components/CreateAdminModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import {
  Users,
  Search,
  Filter,
  Trash2,
  Edit2,
  ShieldPlus,
  RefreshCw,
  Clock,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, male: 0, female: 0, other: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');

  // Modals state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all submissions with optional search & filter
  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (genderFilter && genderFilter !== 'ALL') {
        params.gender = genderFilter;
      }
      if (searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }

      const res = await api.get('/submissions', { params });
      setSubmissions(res.data.submissions || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Fetch submissions error:', err);
      setError(err.response?.data?.message || 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search/filter fetch
    const timeout = setTimeout(() => {
      fetchSubmissions();
    }, 250);

    return () => clearTimeout(timeout);
  }, [genderFilter, searchTerm]);

  // Handle Delete
  const handleDeleteClick = (submission) => {
    setSubmissionToDelete(submission);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!submissionToDelete) return;
    setDeleteLoading(true);

    try {
      await api.delete(`/submissions/${submissionToDelete.id}`);
      setIsDeleteOpen(false);
      setSubmissionToDelete(null);
      fetchSubmissions();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete submission');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Edit
  const handleEditClick = (submission) => {
    setSelectedSubmission(submission);
    setIsEditOpen(true);
  };

  const handleEditSuccess = () => {
    fetchSubmissions();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Admin Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Form Submissions Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, filter, edit, or remove customer applications and manage administrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateAdminOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <ShieldPlus className="w-4 h-4" />
            <span>Create New Admin</span>
          </button>

          <button
            onClick={fetchSubmissions}
            title="Refresh Table"
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Submissions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Male Applicants</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.male}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Female Applicants</p>
            <p className="text-2xl font-bold text-pink-600 mt-1">{stats.female}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Other Applicants</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.other}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by first or last name (case-insensitive)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
          />
        </div>

        {/* Gender Filter Buttons / Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Gender:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['ALL', 'MALE', 'FEMALE', 'OTHER'].map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  genderFilter === g
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g.charAt(0) + g.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Applicant Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Audit Trail</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading submissions...</span>
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <p className="font-medium">No submissions found matching criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try clearing your search term or selecting "All" genders.
                    </p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition group">
                    {/* Name */}
                    <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                      <div>
                        {sub.firstName} {sub.lastName}
                      </div>
                      {sub.feedback && (
                        <p className="text-[11px] text-slate-500 font-normal italic mt-0.5 max-w-xs truncate" title={sub.feedback}>
                          "{sub.feedback}"
                        </p>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <div className="text-slate-800 font-medium">{sub.email}</div>
                      <div className="text-slate-500 text-[11px]">{sub.mobileNumber}</div>
                    </td>

                    {/* Gender */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.gender === 'FEMALE'
                            ? 'bg-pink-100 text-pink-700'
                            : sub.gender === 'MALE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {sub.gender}
                      </span>
                    </td>

                    {/* Address */}
                    <td className="py-4 px-4 text-slate-600 max-w-[200px] truncate" title={sub.address}>
                      {sub.address}
                    </td>

                    {/* Audit Info */}
                    <td className="py-4 px-4 text-[11px] text-slate-500 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Created: {new Date(sub.dateCreated).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        By: {sub.userCreated}
                      </div>
                      {sub.userModified && (
                        <div className="text-[10px] text-amber-700 font-medium">
                          Mod: {new Date(sub.dateModified).toLocaleDateString()} by {sub.userModified}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(sub)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Edit Submission"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(sub)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditSubmissionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        submission={selectedSubmission}
        onSuccess={handleEditSuccess}
      />

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Submission"
        message={
          submissionToDelete
            ? `Are you sure you want to delete the submission for ${submissionToDelete.firstName} ${submissionToDelete.lastName} (${submissionToDelete.email})? This action cannot be reversed.`
            : ''
        }
      />
    </div>
  );
};

export default AdminDashboardPage;
