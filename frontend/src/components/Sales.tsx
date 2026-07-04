import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Calendar, Eye, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { POSModal } from './POSModal';
import { SaleDetailsModal } from './SaleDetailsModal';
import type { Sale } from './SaleDetailsModal';

export const Sales: React.FC = () => {
  const { token } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal triggers
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchSales = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const qp = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        qp.append('search', search);
      }

      const response = await fetch(`${API_BASE_URL}/sales?${qp.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sales logs.');
      }

      const result = await response.json();
      setSales(result.data);
      setTotalPages(result.meta.last_page);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading sales logs.');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleViewDetails = (saleId: number) => {
    setSelectedSaleId(saleId);
    setIsDetailsOpen(true);
  };

  const handlePOSSuccess = () => {
    setPage(1);
    fetchSales();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: 0 }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="text"
                placeholder="Search by customer or clerk..."
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setIsPOSOpen(true)}
          style={{ height: '42px' }}
        >
          <Plus size={20} />
          <span>New POS Register</span>
        </button>
      </div>

      {/* Main Table Grid Card */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px' }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading sales logs...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>
            <p>{error}</p>
          </div>
        ) : (
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '150px' }}>Transaction Date</th>
                  <th>Customer Name</th>
                  <th>Clerk / Clerical User</th>
                  <th style={{ textAlign: 'center' }}>Unique Products</th>
                  <th style={{ textAlign: 'right' }}>Total Amount Paid</th>
                  <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.sale_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                        <Calendar size={16} style={{ color: 'var(--primary)' }} />
                        <span>{new Date(sale.sale_date).toLocaleDateString()}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                          {new Date(sale.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sale.customer?.name}
                      </div>
                      {sale.customer?.contact_no && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {sale.customer.contact_no}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-primary)' }}>{sale.admin?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{sale.admin?.email}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {sale.items?.length || 0}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem' }}>
                      ${sale.total_amount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleViewDetails(sale.sale_id)}
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No sales records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary"
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* POS Modal */}
      <POSModal
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
        onSuccess={handlePOSSuccess}
      />

      {/* Sale Details Modal */}
      <SaleDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedSaleId(null);
        }}
        saleId={selectedSaleId}
      />
    </div>
  );
};
