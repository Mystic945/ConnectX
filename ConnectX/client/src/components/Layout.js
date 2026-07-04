import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { to: '/discover', icon: '⚡', label: 'Discover' },
  { to: '/matches',  icon: '💬', label: 'Matches'  },
  { to: '/profile',  icon: '👤', label: 'Profile'  },
];

export default function Layout() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat/');

  return (
    <div className="layout">
      <main className="layout-main">
        <Outlet />
      </main>
      {!isChatPage && (
        <nav className="bottom-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
