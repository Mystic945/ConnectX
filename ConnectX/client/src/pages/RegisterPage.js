import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import GoogleAuthButton from '../components/GoogleAuthButton';
import GoogleCollegeForm from '../components/GoogleCollegeForm';
import './AuthPages.css';

const MAHARASHTRA_COLLEGES = [
  'D.Y. Patil Institute of Technology, Pimpri',
  'MIT College of Engineering, Pune',
  'COEP Technological University, Pune',
  'Pune Institute of Computer Technology',
  'Vishwakarma Institute of Technology, Pune',
  'Sinhgad College of Engineering, Pune',
  'VJTI Mumbai',
  'DJ Sanghvi College of Engineering, Mumbai',
  'K.J. Somaiya College of Engineering, Mumbai',
  'PCCOE, Pune',
  'Symbiosis Institute of Technology, Pune',
  'Bharati Vidyapeeth College of Engineering, Pune',
  'Army Institute of Technology, Pune',
  'Cummins College of Engineering for Women, Pune',
  'MAEER MIT, Pune',
  'College of Engineering Nashik',
  'Government College of Engineering Aurangabad',
  'Government College of Engineering Amravati',
  'Nagpur Institute of Technology',
  'Other',
];

const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'AIDS (AI & Data Science)',
  'IoT',
  'Chemical Engineering',
  'Production Engineering',
  'MCA', 'MBA', 'BCA', 'BBA',
  'Other',
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: '', college: '', branch: '', year: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [pendingCredential, setPendingCredential] = useState(null);
  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  // Email/password register
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Account created!');
      navigate('/setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google credential received
  const handleGoogleCredential = async (credential) => {
    setGoogleLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });

      if (res.status === 206 && res.data.needsCollegeInfo) {
        setGoogleData(res.data.googleData);
        setPendingCredential(credential);
        setGoogleLoading(false);
        return;
      }

      // Already has an account — log them in
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
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">CX</div>
          <span className="auth-brand-name">ConnectX</span>
        </div>
        <div className="auth-left-content">
          <h2>Join your campus community.</h2>
          <p>Thousands of students are already connecting. Create your account and start swiping.</p>
          <div className="auth-left-features">
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">🎓</div>
              Only students from your college
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">⚡</div>
              Set up your profile in 3 minutes
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">💜</div>
              Free forever — no hidden fees
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: 460 }}>
          <div className="auth-mobile-logo">
            <div className="auth-mobile-logo-icon">CX</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>ConnectX</span>
          </div>

          {googleData ? (
            <GoogleCollegeForm
              googleData={googleData}
              onSubmit={handleCollegeSubmit}
              loading={googleLoading}
            />
          ) : (
            <>
              <div className="auth-card-header">
                <h1>Create your account</h1>
                <p>Takes less than 2 minutes</p>
              </div>

              {/* Google button */}
              <div style={{ marginBottom: 20 }}>
                <GoogleAuthButton onCredential={handleGoogleCredential} />
                {googleLoading && (
                  <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--text-3)' }}>
                    Setting up with Google...
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="auth-divider">
                <span>or sign up with email</span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Full name</label>
                    <input type="text" className="form-input" placeholder="Arya Sharma" value={form.name} onChange={set('name')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-input" placeholder="19" min="17" max="30" value={form.age} onChange={set('age')} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={set('gender')} required>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">College</label>
                  <select className="form-select" value={form.college} onChange={set('college')} required>
                    <option value="">Select your college</option>
                    {MAHARASHTRA_COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={form.branch} onChange={set('branch')} required>
                      <option value="">Select branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select className="form-select" value={form.year} onChange={set('year')} required>
                      <option value="">Year</option>
                      <option value="FY">FY</option>
                      <option value="SY">SY</option>
                      <option value="TY">TY</option>
                      <option value="Final Year">Final Year</option>
                      <option value="Postgrad">Postgrad</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" placeholder="Min 8 chars" value={form.password} onChange={set('password')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm password</label>
                    <input type="password" className="form-input" placeholder="Repeat" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                  </div>
                </div>

                <p className="auth-terms">By signing up you agree to use ConnectX respectfully.</p>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="auth-footer">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
