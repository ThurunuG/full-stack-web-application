import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the authentication state before deciding whether access is allowed.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // Preserve the requested location so the user can be redirected back after login.
  if (!user) {
    // If target is admin route, redirect to admin login, otherwise customer login
    const isTargetAdmin = allowedRoles?.includes('ADMIN');
    return <Navigate to={isTargetAdmin ? '/admin/login' : '/login'} state={{ from: location }} replace />;
  }

  // Prevent authenticated users from viewing routes outside their assigned role.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 text-sm mb-6">
            Your current role (<span className="font-semibold text-slate-800">{user.role}</span>) does not have permission to view this page.
          </p>
          <a
            href={user.role === 'ADMIN' ? '/admin/dashboard' : '/apply'}
            className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
          >
            Go to Your Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
