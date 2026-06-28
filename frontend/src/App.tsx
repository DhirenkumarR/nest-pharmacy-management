import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { DashboardShell } from './components/DashboardShell';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} size={48} />
        <p style={{ color: 'var(--text-secondary)' }}>Authenticating session...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!token || !user) {
    return <Login />;
  }

  return <DashboardShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
