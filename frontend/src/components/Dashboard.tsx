import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

interface Stats {
  totalMedicines: number;
  lowStockMedicines: number;
  outOfStockMedicines: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
}

interface GraphItem {
  date?: string;
  week?: string;
  month?: string;
  revenue: number;
  sales: number;
}

interface DashboardData {
  stats: Stats;
  graphs: {
    daily: GraphItem[];
    weekly: GraphItem[];
    monthly: GraphItem[];
  };
}

export const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard statistics.');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ marginTop: '16px' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { stats, graphs } = data;

  // Format chart data based on temporal filter
  const getChartData = () => {
    if (filter === 'daily') {
      return graphs.daily.map((d) => ({
        label: d.date ? d.date.split('-').slice(1).join('/') : '',
        value: d.revenue,
        tooltip: `Date: ${d.date}\nRevenue: $${d.revenue.toFixed(2)}\nSales: ${d.sales}`,
      })).slice(-12); // Show last 12 entries for visual space
    } else if (filter === 'weekly') {
      return graphs.weekly.map((w) => {
        const parts = w.week ? w.week.split('-') : [];
        const label = parts.length > 1 ? `W${parts[1]}` : (w.week || '');
        return {
          label,
          value: w.revenue,
          tooltip: `Week: ${w.week}\nRevenue: $${w.revenue.toFixed(2)}\nSales: ${w.sales}`,
        };
      }).slice(-12);
    } else {
      return graphs.monthly.map((m) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const parts = m.month ? m.month.split('-') : [];
        const label = parts.length > 1 ? monthNames[parseInt(parts[1], 10) - 1] || m.month : (m.month || '');
        return {
          label,
          value: m.revenue,
          tooltip: `Month: ${m.month}\nRevenue: $${m.revenue.toFixed(2)}\nSales: ${m.sales}`,
        };
      }).slice(-12);
    }
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData.map((d) => d.value), 100);
  const chartHeight = 160;
  const colStep = 600 / (chartData.length || 1);
  const colWidth = colStep * 0.6;

  // Horizontal Grid Lines Positions
  const gridLines = [20, 60, 100, 140, 180];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
      
      {/* 1. PRIMARY METRICS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* Revenue Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Revenue</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6'
          }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Transactions</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {stats.totalSales}
            </div>
          </div>
        </div>

        {/* Medicines Stock Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: stats.outOfStockMedicines > 0 || stats.lowStockMedicines > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            color: stats.outOfStockMedicines > 0 || stats.lowStockMedicines > 0 ? '#f59e0b' : 'var(--primary)'
          }}>
            <Package size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Medicine Inventory</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {stats.totalMedicines}
            </div>
            {(stats.outOfStockMedicines > 0 || stats.lowStockMedicines > 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px', fontWeight: 500 }}>
                <AlertTriangle size={12} />
                <span>
                  {stats.outOfStockMedicines} out of stock / {stats.lowStockMedicines} low stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Suppliers & Customers Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            color: '#6b7280'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Suppliers & Customers</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {stats.totalSuppliers} / {stats.totalCustomers}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SALES CHARTS PANEL */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sales Trends</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Track revenue volumes across different calendar groupings
            </p>
          </div>
          
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {(['daily', 'weekly', 'monthly'] as const).map((r) => (
              <button
                key={r}
                className="btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  border: 'none',
                  backgroundColor: filter === r ? 'var(--primary)' : 'transparent',
                  color: filter === r ? 'white' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-xs)',
                  minWidth: '70px'
                }}
                onClick={() => setFilter(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom SVG Bar Chart */}
        <div style={{ position: 'relative', width: '100%', minHeight: '220px', padding: '10px 0' }}>
          {chartData.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-tertiary)' }}>
              No transactional data available.
            </div>
          ) : (
            <svg 
              viewBox="0 0 650 220" 
              width="100%" 
              height="100%" 
              style={{ overflow: 'visible', width: '100%' }}
            >
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {gridLines.map((yVal, idx) => (
                <line 
                  key={idx} 
                  x1="40" 
                  y1={yVal} 
                  x2="630" 
                  y2={yVal} 
                  stroke="var(--border-color)" 
                  strokeDasharray="4 4" 
                />
              ))}

              {/* Columns */}
              {chartData.map((d, i) => {
                const x = 40 + i * colStep + (colStep - colWidth) / 2;
                const height = maxVal > 0 ? (d.value / maxVal) * chartHeight : 0;
                const y = 180 - height;
                return (
                  <g key={i} className="chart-bar-group">
                    <rect 
                      x={x} 
                      y={y} 
                      width={colWidth} 
                      height={height} 
                      rx="4" 
                      fill="url(#barGrad)"
                      style={{ cursor: 'pointer', transition: 'all var(--transition-normal)' }}
                    >
                      <title>{d.tooltip}</title>
                    </rect>
                    
                    {/* Value label on top of columns */}
                    {d.value > 0 && (
                      <text 
                        x={x + colWidth / 2} 
                        y={y - 8} 
                        textAnchor="middle" 
                        fontSize="9" 
                        fill="var(--text-secondary)" 
                        fontWeight="600"
                      >
                        ${d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : Math.round(d.value)}
                      </text>
                    )}

                    {/* Temporal Label bottom */}
                    <text 
                      x={x + colWidth / 2} 
                      y="198" 
                      textAnchor="middle" 
                      fontSize="9" 
                      fill="var(--text-tertiary)"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}

              {/* Left Y Axis Label */}
              <text x="35" y="24" textAnchor="end" fontSize="9" fill="var(--text-tertiary)">${Math.round(maxVal)}</text>
              <text x="35" y="104" textAnchor="end" fontSize="9" fill="var(--text-tertiary)">${Math.round(maxVal / 2)}</text>
              <text x="35" y="184" textAnchor="end" fontSize="9" fill="var(--text-tertiary)">$0</text>
            </svg>
          )}
        </div>
      </div>

    </div>
  );
};
