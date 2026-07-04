import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

const MAHARASHTRA_COLLEGES = [
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
  'Dr DY Patil Institue of Technology Pimpri Pune',
  'other',
];

const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Instrumentation Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'ENTC',
  'AIDS (AI & Data Science)',
  'IoT',
  'Chemical Engineering',
  'Production Engineering',
  'MCA',
  'MBA',
  'BCA',
  'BBA',
  'Other',
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: '', college: '', branch: '', year: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Account created! Set up your profile.');
      navigate('/setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            🎓 Campus<span className="text-gradient">Connect</span>
          </Link>
          <h2>Create your account</h2>
          <p>Join your campus community</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Arya Sharma" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" className="form-input" placeholder="19" min="17" max="30" value={form.age} onChange={set('age')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
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
              {MAHARASHTRA_COLLEGES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select className="form-select" value={form.branch} onChange={set('branch')} required>
                <option value="">Select branch</option>
                {BRANCHES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
          </div>

          <p className="terms-note">
            By signing up, you agree to use this platform respectfully. This is an unofficial student project.
          </p>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
