import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/discover', icon: '⚡', label: 'Discover' },
  { to: '/matches',  icon: '💬', label: 'Matches'  },
  { to: '/profile',  icon: '👤', label: 'Profile'  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label || 'ConnectX';

  return (
    <div className="app-shell">

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="app-sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">CX</div>
          <span className="sidebar-logo-text">ConnectX</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => setShowMenu(!showMenu)}>
            <div className="sidebar-user-avatar">
              {user?.photos?.[0] ? (
                <img src={user.photos[0].url} alt={user.name} className="avatar" style={{ width: 32, height: 32 }} />
              ) : (
                <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 13 }}>
                  {user?.name?.[0]}
                </div>
              )}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-sub">{user?.branch} • {user?.year}</div>
            </div>
            <div className="sidebar-user-dots">⋯</div>
          </div>

          {showMenu && (
            <div className="sidebar-menu">
              <button className="sidebar-menu-item" onClick={() => { navigate('/profile/edit'); setShowMenu(false); }}>
                Edit profile
              </button>
              <button className="sidebar-menu-item danger" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="app-mobile-topbar">
        <div className="mobile-logo">
          <div className="mobile-logo-icon">CX</div>
          <span className="mobile-logo-text">ConnectX</span>
        </div>
        <div className="mobile-topbar-title">{pageTitle}</div>
        <button
          className="btn-icon"
          onClick={() => navigate('/profile')}
          style={{ background: 'transparent', border: 'none' }}
        >
          {user?.photos?.[0] ? (
            <img src={user.photos[0].url} alt="" className="avatar" style={{ width: 28, height: 28 }} />
          ) : (
            <div className="avatar-placeholder" style={{ width: 28, height: 28, fontSize: 12 }}>
              {user?.name?.[0]}
            </div>
          )}
        </button>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="app-mobile-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  );
}
