import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Key, UserCheck, HeartHandshake, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const executeLogin = async (loginEmail, loginPassword) => {
    setError(null);
    setIsSubmitting(true);

    const res = await login((loginEmail || email).trim(), (loginPassword || password).trim());
    setIsSubmitting(false);

    if (res.success) {
      if (res.user.role === 'ADMIN' || res.user.role === 'VOLUNTEER') {
        navigate(from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      setError(res.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin();
  };

  const handleQuickLogin = (role) => {
    let creds = { email: '', password: '' };
    if (role === 'ADMIN') {
      creds = { email: 'admin@godavariseva.gov.in', password: 'Admin@2027' };
    } else if (role === 'VOLUNTEER') {
      creds = { email: 'volunteer@godavariseva.gov.in', password: 'Volunteer@2027' };
    } else {
      creds = { email: 'pilgrim@example.com', password: 'Pilgrim@2027' };
    }

    setEmail(creds.email);
    setPassword(creds.password);
    executeLogin(creds.email, creds.password);
  };

  const fillCredentialsOnly = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin@godavariseva.gov.in');
      setPassword('Admin@2027');
    } else if (role === 'VOLUNTEER') {
      setEmail('volunteer@godavariseva.gov.in');
      setPassword('Volunteer@2027');
    } else {
      setEmail('pilgrim@example.com');
      setPassword('Pilgrim@2027');
    }
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6 text-saffron-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Official Portal Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Godavari GeoSeva 2027 Administration, Volunteer & Pilgrim Access
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">Authentication Notice:</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 1-Click Demo Logins Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 to-slate-50 border border-teal-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-900 uppercase tracking-wider">
              <Key className="w-3.5 h-3.5 text-teal-700" />
              1-Click Instant Demo Login:
            </span>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
              Pushkaralu 2027
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Admin */}
            <div className="bg-white p-2.5 rounded-xl border border-teal-200/80 hover:border-teal-500 transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                  <Shield className="w-3 h-3 text-teal-700" />
                  Admin
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" title="admin@godavariseva.gov.in">
                  admin@godavariseva.gov.in
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Admin@2027</div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('ADMIN')}
                className="mt-2 w-full py-1 text-[10px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-700 hover:text-white rounded-lg transition-colors border border-teal-200"
              >
                1-Click Login
              </button>
            </div>

            {/* Volunteer */}
            <div className="bg-white p-2.5 rounded-xl border border-teal-200/80 hover:border-teal-500 transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                  <UserCheck className="w-3 h-3 text-saffron-600" />
                  Volunteer
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" title="volunteer@godavariseva.gov.in">
                  volunteer@godavariseva.gov.in
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Volunteer@2027</div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('VOLUNTEER')}
                className="mt-2 w-full py-1 text-[10px] font-bold text-saffron-800 bg-saffron-50 hover:bg-saffron-600 hover:text-white rounded-lg transition-colors border border-saffron-200"
              >
                1-Click Login
              </button>
            </div>

            {/* Pilgrim */}
            <div className="bg-white p-2.5 rounded-xl border border-teal-200/80 hover:border-teal-500 transition-all flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                  <HeartHandshake className="w-3 h-3 text-cyan-700" />
                  Pilgrim
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" title="pilgrim@example.com">
                  pilgrim@example.com
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Pilgrim@2027</div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('PILGRIM')}
                className="mt-2 w-full py-1 text-[10px] font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-700 hover:text-white rounded-lg transition-colors border border-cyan-200"
              >
                1-Click Login
              </button>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official@godavariseva.gov.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'Authenticating Credentials...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-saffron-400" />
          </button>
        </form>

        {/* Register link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Need a new volunteer or pilgrim account?{' '}
          <Link to="/register" className="text-teal-800 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
