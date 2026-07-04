import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Package,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  User,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { Suppliers } from './Suppliers';
import { Medicines } from './Medicines';
import { Sales } from './Sales';


export const DashboardShell = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'medicines' | 'sales'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'medicines', label: 'Medicines', icon: Package },
    { id: 'sales', label: 'Sales & POS', icon: ShoppingCart },
  ] as const;

  const handleTabChange = (tabId: 'dashboard' | 'suppliers' | 'medicines' | 'sales') => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={24} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>RxPharmacy</span>
        </div>
        <div style={{ width: '24px' }}></div> {/* Spacer to center the logo */}
      </div>

      {/* Sidebar overlay backdrop for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={28} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              RxPharmacy
            </span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
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
          marginBottom: '32px',
          flexShrink: 0
        }}>
          <div>
            <h1 style={{ textTransform: 'capitalize' }}>{activeTab}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage and view pharmacy operations
            </p>
          </div>
        </header>

        {/* Render actual component or dynamic view placeholders */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeTab === 'suppliers' ? (
            <Suppliers />
          ) : activeTab === 'medicines' ? (
            <Medicines />
          ) : activeTab === 'sales' ? (
            <Sales />
          ) : (
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)'
              }}>
                {activeTab === 'dashboard' && <LayoutDashboard size={48} />}
              </div>
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center' }}>
                The {activeTab} view will populate here. Currently, you are successfully authenticated as <strong>{user?.email}</strong>.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
