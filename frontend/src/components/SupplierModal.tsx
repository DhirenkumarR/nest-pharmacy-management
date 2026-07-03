import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export interface Supplier {
  supplier_id: number;
  name: string;
  contact_no: string | null;
  email: string | null;
  address: string | null;
}

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier: Supplier | null; // null if adding, supplier details if editing
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  supplier,
}) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name || '');
      setContactNo(supplier.contact_no || '');
      setEmail(supplier.email || '');
      setAddress(supplier.address || '');
    } else {
      setName('');
      setContactNo('');
      setEmail('');
      setAddress('');
    }
    setError(null);
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Supplier name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      contact_no: contactNo.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
    };

    try {
      const url = supplier
        ? `${API_BASE_URL}/suppliers/${supplier.supplier_id}`
        : `${API_BASE_URL}/suppliers`;
      const method = supplier ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || 'Failed to save supplier.'
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '16px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="supplier-name">
              Supplier Name *
            </label>
            <input
              id="supplier-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Pharmaceuticals"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="supplier-phone">
              Contact Number
            </label>
            <input
              id="supplier-phone"
              type="text"
              className="form-input"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              placeholder="e.g. +1 (555) 019-2834"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="supplier-email">
              Email Address
            </label>
            <input
              id="supplier-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@acmepharma.com"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="supplier-address">
              Address
            </label>
            <input
              id="supplier-address"
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Health Ave, Suite 400"
              disabled={submitting}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '100px' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                'Save Supplier'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
