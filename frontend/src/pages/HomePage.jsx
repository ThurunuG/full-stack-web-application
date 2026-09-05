import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  FileCheck,
  Users,
  Filter,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const HomePage = () => {
  const { user, isCustomer, isAdmin } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Introduce the application and direct users to the appropriate portal. */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Full-Stack Technical Assessment
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Role-Based Authentication & <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600">
                CRUD Form Management
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              A full-stack web application featuring secure JWT authentication with access and refresh tokens, strict role-based access control (RBAC), customer form submissions with validation, and an interactive admin dashboard.
            </p>

            {/* Authenticated users see their destination; guests see both portals. */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/apply'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-500/20 transition-all hover:-translate-y-0.5"
                >
                  <span>Go to {isAdmin ? 'Admin Dashboard' : 'Application Form'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-500/20 transition-all hover:-translate-y-0.5"
                  >
                    <span>Customer Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/admin/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-sm transition-all hover:-translate-y-0.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Admin Portal</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Demo credentials make the application easy to evaluate locally. */}
          <div className="mt-14 max-w-2xl mx-auto bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-sky-600" />
              <span>Pre-Seeded Credentials for Instant Evaluation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl space-y-1">
                <span className="font-bold text-purple-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
                </span>
                <p className="text-slate-600">Email: <span className="font-mono font-medium text-slate-800">admin@evotec.software</span></p>
                <p className="text-slate-600">Password: <span className="font-mono font-medium text-slate-800">Admin@12345</span></p>
              </div>

              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl space-y-1">
                <span className="font-bold text-sky-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Sample Customer
                </span>
                <p className="text-slate-600">Email: <span className="font-mono font-medium text-slate-800">customer@example.com</span></p>
                <p className="text-slate-600">Password: <span className="font-mono font-medium text-slate-800">Customer@123</span></p>
              </div>
            </div>
          </div>

          {/* Summarize the core security, validation, and administration features. */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">JWT & RBAC Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Short-lived Access tokens, persistent Refresh tokens with auto-renewal, bcrypt password hashing, and strict role guards separating Customers and Administrators.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Form Validation & Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full client and server validation for name, unique email, phone format, and gender enums. Automated tracking of <span className="font-mono text-[11px]">userCreated</span>, <span className="font-mono text-[11px]">dateCreated</span>, and modification audit logs.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Admin CRUD, Search & Filter</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Admins can search submissions by first/last name with case-insensitive partial matching, filter by gender (MALE, FEMALE, OTHER), edit records, delete items, and provision new admins with auto-generated passwords.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Keep the evaluation context visible at the bottom of the page. */}
      <footer className="border-t border-slate-200 py-6 bg-white/50 text-center text-xs text-slate-500">
        <p>Full-Stack Web Application Assignment • Built for Evotec Software Evaluation</p>
      </footer>
    </div>
  );
};

export default HomePage;
