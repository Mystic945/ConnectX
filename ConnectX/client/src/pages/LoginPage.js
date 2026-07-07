import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

      {/* Right panel - form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-mobile-logo">
            <div className="auth-mobile-logo-icon">CX</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>ConnectX</span>
          </div>

          <div className="auth-card-header">
            <h1>Welcome back</h1>
            <p>Log in to your ConnectX account</p>
          </div>

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
        </div>
      </div>
    </div>
  );
}
