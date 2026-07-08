import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import GoogleAuthButton from '../components/GoogleAuthButton';
import GoogleCollegeForm from '../components/GoogleCollegeForm';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleData, setGoogleData] = useState(null); // set when new Google user needs college info
  const [pendingCredential, setPendingCredential] = useState(null);
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  // Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/discover');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google credential received from button
  const handleGoogleCredential = async (credential) => {
    setGoogleLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });

      if (res.status === 206 && res.data.needsCollegeInfo) {
        // New user — needs college info
        setGoogleData(res.data.googleData);
        setPendingCredential(credential);
        setGoogleLoading(false);
        return;
      }

      // Existing user — logged in
      const { token, user } = res.data;
      localStorage.setItem('cc_token', token);
      localStorage.setItem('cc_user', JSON.stringify(user));
      updateUser(user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.profileComplete ? '/discover' : '/setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  };

  // New Google user submitted college info
  const handleCollegeSubmit = async (collegeInfo) => {
    setGoogleLoading(true);
    try {
      const res = await api.post('/auth/google', {
        credential: pendingCredential,
        ...collegeInfo,
      });

      const { token, user } = res.data;
      localStorage.setItem('cc_token', token);
      localStorage.setItem('cc_user', JSON.stringify(user));
      updateUser(user);
      toast.success(`Welcome to ConnectX, ${user.name.split(' ')[0]}!`);
      navigate('/setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not complete sign up.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel - desktop only */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">CX</div>
          <span className="auth-brand-name">ConnectX</span>
        </div>
        <div className="auth-left-content">
          <h2>Connect with your campus.</h2>
          <p>Find the people you're meant to meet — all within your college.</p>
          <div className="auth-left-features">
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">⚡</div>
              Social connect & dating in one app
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">🔒</div>
              College-scoped — your campus only
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">💬</div>
              Real-time chat with your matches
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-mobile-logo">
            <div className="auth-mobile-logo-icon">CX</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>ConnectX</span>
          </div>

          {/* If new Google user needs college info */}
          {googleData ? (
            <GoogleCollegeForm
              googleData={googleData}
              onSubmit={handleCollegeSubmit}
              loading={googleLoading}
            />
          ) : (
            <>
              <div className="auth-card-header">
                <h1>Welcome back</h1>
                <p>Log in to your ConnectX account</p>
              </div>

              {/* Google button */}
              <div style={{ marginBottom: 20 }}>
                <GoogleAuthButton onCredential={handleGoogleCredential} />
                {googleLoading && (
                  <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--text-3)' }}>
                    Signing in with Google...
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="auth-divider">
                <span>or continue with email</span>
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: 4 }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>

              <p className="auth-footer">
                Don't have an account? <Link to="/register">Sign up</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
