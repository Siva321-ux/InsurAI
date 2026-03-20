import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Shield,
  Wallet,
  Settings,
  LogOut,
  Zap,
  Activity,
  MapPin
} from 'lucide-react';

const navItems = [
  { to: '/',        label: 'Overview',      icon: LayoutDashboard },
  { to: '/plans',   label: 'Subscription',  icon: Shield },
  { to: '/payouts', label: 'Payout History', icon: Wallet },
  { to: '/admin',   label: 'Admin Console', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Zap size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h2>GigShield</h2>
        </div>
      </div>

      <hr className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-heading">MENU</span>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name || 'Worker'}</span>
          <span className="user-zone">
            <MapPin size={12} /> Zone {user?.activeZone || '---'}
          </span>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        .sidebar {
          justify-content: space-between;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .brand-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--accent-orange-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }
        .sidebar-brand h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }
        .sidebar-divider {
          border: none;
          height: 1px;
          background: var(--border-subtle);
          margin-bottom: 24px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .nav-heading {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          padding-left: 12px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          text-decoration: none;
        }
        .nav-item:hover {
          color: var(--text-primary);
          background: #F3F4F6;
        }
        .nav-item.active {
          color: var(--primary);
          background: var(--accent-orange-light);
          font-weight: 600;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 12px;
          border-top: 1px solid var(--border-subtle);
          margin-top: auto;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
          color: #fff;
          flex-shrink: 0;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }
        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-zone {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .logout-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logout-btn:hover {
          color: var(--text-primary);
          background: #F3F4F6;
        }
      `}</style>
    </aside>
  );
}
