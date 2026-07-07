import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">CX</div>
          <span className="landing-logo-text">ConnectX</span>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" />
          Only for college students in Maharashtra
        </div>

        <h1 className="hero-title">
          Your campus.<br />
          <span className="hero-title-accent">Your people.</span>
        </h1>

        <p className="hero-desc">
          Find study partners, teammates, and friends — or something more.
          ConnectX connects you with people from your own college.
        </p>

        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg">
            Join ConnectX free
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg">
            Log in
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value">2 modes</div>
            <div className="stat-label">Social + Dating</div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <div className="stat-value">1 campus</div>
            <div className="stat-label">Your college only</div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <div className="stat-value">Real-time</div>
            <div className="stat-label">Instant chat</div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">⚡</div>
            <div className="feature-card-body">
              <h3>Social Connect</h3>
              <p>Find study partners, hackathon teams, and project collaborators within your campus.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">💜</div>
            <div className="feature-card-body">
              <h3>Dating</h3>
              <p>Swipe and match with people from your college who are looking for something more.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">🔒</div>
            <div className="feature-card-body">
              <h3>College-only</h3>
              <p>Your discovery is scoped to your campus. Everyone here goes to your college.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© 2026 ConnectX</span>
        <span className="footer-dot">·</span>
        <span>Built by a student, for students</span>
      </footer>
    </div>
  );
}
