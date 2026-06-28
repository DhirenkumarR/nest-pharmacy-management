import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Package,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  User,
  Activity
} from 'lucide-react';

export const DashboardShell = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'medicines' | 'sales'>('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'medicines', label: 'Medicines', icon: Package },
    { id: 'sales', label: 'Sales & POS', icon: ShoppingCart },
  ] as const;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <Activity size={28} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            RxPharmacy
          </span>

        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '12px 16px',
                  width: '100%',
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <User size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || 'Super Admin'}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.email || 'admin@pharmacy.com'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '10px' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ textTransform: 'capitalize' }}>{activeTab}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage and view pharmacy operations
            </p>
          </div>
        </header>

        {/* Dynamic View Placeholders */}
        <div className="glass-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          <div style={{
            padding: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)'
          }}>
            {activeTab === 'dashboard' && <LayoutDashboard size={48} />}
            {activeTab === 'suppliers' && <Users size={48} />}
            {activeTab === 'medicines' && <Package size={48} />}
            {activeTab === 'sales' && <ShoppingCart size={48} />}
          </div>
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center' }}>
            The {activeTab} view will populate here. Currently, you are successfully authenticated as <strong>{user?.email}</strong>.
          </p>
        </div>
      </main>
    </div>
  );
};
