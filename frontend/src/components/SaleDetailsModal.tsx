import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export interface SaleItem {
  sale_item_id: number;
  sale_id: number;
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  sale_id: number;
  customer_id: number;
  admin_id: number;
  total_amount: number;
  sale_date: string;
  customer?: {
    customer_id: number;
    name: string;
    contact_no: string | null;
    email: string | null;
    address: string | null;
  } | null;
  admin?: {
    admin_id: number;
    name: string;
    email: string;
  } | null;
  items?: SaleItem[];
}

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: number | null;
}

export const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
  isOpen,
  onClose,
  saleId,
}) => {
  const { token } = useAuth();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      if (!isOpen || !saleId || !token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/sales/${saleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to load transaction details.');
        }
        const data = await response.json();
        setSale(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [saleId, isOpen, token]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '650px' }}
      >
        <div className="modal-header">
          <h2>Sale Transaction Details</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '12px' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading sale details...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--danger)' }}>
            <p>{error}</p>
          </div>
        ) : sale ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Meta Details Card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>Customer</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {sale.customer?.name}
                </div>
                {(sale.customer?.contact_no || sale.customer?.email) && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {sale.customer?.contact_no} {sale.customer?.email && `(${sale.customer.email})`}
                  </div>
                )}
              </div>
              
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>Transaction Info</span>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', marginTop: '4px' }}>
                  <strong>Clerk:</strong> {sale.admin?.name || 'Unknown'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                  {new Date(sale.sale_date).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Items Breakdown Table */}
            <div>
              <h3 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>Items Checklist</h3>
              <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ minWidth: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>Medicine</th>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items?.map((item) => (
                      <tr key={item.sale_item_id}>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 500 }}>{item.medicine_name}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', textAlign: 'right', fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals panel */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Total Amount Paid:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ${sale.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '12px' }}>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
};
