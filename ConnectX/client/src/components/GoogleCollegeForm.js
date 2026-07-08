import React, { useState } from 'react';

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

// This form is shown when a NEW Google user needs to provide
// college info before their account is created
export default function GoogleCollegeForm({ googleData, onSubmit, loading }) {
  const [form, setForm] = useState({
    age: '',
    gender: '',
    college: '',
    branch: '',
    year: '',
  });

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.age || !form.gender || !form.college || !form.branch || !form.year) return;
    onSubmit({ ...form, age: parseInt(form.age) });
  };

  return (
    <div>
      <div className="auth-card-header" style={{ marginBottom: 20 }}>
        <h1>One more step</h1>
        <p>Hi {googleData?.name?.split(' ')[0]}! We need a few more details to set up your ConnectX account.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-input"
              placeholder="19"
              min="17"
              max="30"
              value={form.age}
              onChange={set('age')}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={form.gender} onChange={set('gender')} required>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
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

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 8 }}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Complete sign up'}
        </button>
      </form>
    </div>
  );
}
