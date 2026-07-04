import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">Connect<span className="text-gradient">X</span></span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Join now</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span>✦</span> Only for college students
        </div>
        <h1 className="hero-title">
          Your campus,<br />
          <span className="text-gradient">your connections.</span>
        </h1>
        <p className="hero-subtitle">
          Find study partners, project teammates, friends,<br />
          or something more — all within your college.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get started free
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Already a member
          </Link>
        </div>

        {/* Floating cards preview */}
        <div className="hero-preview">
          <div className="preview-card preview-card-1 float">
            <div className="preview-avatar" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>A</div>
            <div className="preview-info">
              <div className="preview-name">Arya, 19</div>
              <div className="preview-sub">Computer Sci • FY</div>
            </div>
            <div className="preview-tag tag tag-purple">Open to projects</div>
          </div>
          <div className="preview-card preview-card-2">
            <div className="preview-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>R</div>
            <div className="preview-info">
              <div className="preview-name">Rohan, 21</div>
              <div className="preview-sub">Mech Engg • TY</div>
            </div>
            <div className="preview-tag tag tag-blue">Looking for team</div>
          </div>
          <div className="preview-card preview-card-3">
            <div className="preview-avatar" style={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}>P</div>
            <div className="preview-info">
              <div className="preview-name">Priya, 20</div>
              <div className="preview-sub">IT • SY</div>
            </div>
            <div className="preview-tag tag tag-pink">Dating</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-card card">
            <div className="feature-icon">🤝</div>
            <h3>Social Connect</h3>
            <p>Find study partners, project teammates, hackathon collaborators, or just friends on campus.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">💜</div>
            <h3>Dating</h3>
            <p>Swipe, match, and chat with people from your college who are also looking for something more.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">🔒</div>
            <h3>College-only</h3>
            <p>Your circle stays within your campus. Everyone here is a real student, just like you.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 ConnectX • Built by a student, for students</p>
        <p className="footer-disclaimer">
          This is an independent, unofficial project — not affiliated with any college or university.
        </p>
      </footer>
    </div>
  );
}
