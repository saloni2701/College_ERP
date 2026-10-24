import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import Icon from "../common/Icon";
import ThemeToggle from "../common/ThemeToggle";
import { NAV_GROUPS, NAV_ITEMS } from "../../config/navigation";
import srmLogo from "../../assets/srm_logo.png";

export default function AppLayout({ user, onLogout, theme, onToggleTheme, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  const currentPage =
    NAV_ITEMS.find((item) => item.path === pathname)?.label || "Dashboard";

  return (
    <div className="app-shell">
      {/* ---------- Sidebar ---------- */}
      <aside
        id="primary-navigation"
        className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-brand">
          <img src={srmLogo} alt="SRM University logo" />
          <div>
            <div className="sidebar-brand-name">SRM University</div>
            <div className="sidebar-brand-sub">College ERP Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {NAV_GROUPS.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <div className="sidebar-group-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-link" onClick={onLogout}>
            <Icon name="logout" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      {/* ---------- Main column ---------- */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name="menu" size={22} />
            </button>
            <span className="topbar-title">{currentPage}</span>
          </div>

          <div className="topbar-user">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <div className="topbar-user-text">
              <div className="topbar-user-name">{user.name}</div>
              <div className="topbar-user-id">{user.id}</div>
            </div>
            <div className="avatar" aria-hidden="true">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="content">{children}</main>

        <footer className="app-footer">
          © {new Date().getFullYear()} SRM University. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
