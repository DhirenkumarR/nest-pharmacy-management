import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export interface SupplierDropdownItem {
  supplier_id: number;
  name: string;
}

export interface Medicine {
  medicine_id: number;
  supplier_id: number | null;
  name: string;
  generic_name: string | null;
  manufacturer: string | null;
  drug_type: string;
  batch_no: string | null;
  expiry_date: string | null;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  supplier?: {
    supplier_id: number;
    name: string;
  } | null;
}

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  medicine: Medicine | null; // null if adding, medicine details if editing
}

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  medicine,
}) => {
  const { token } = useAuth();
  
  // Form fields
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [drugType, setDrugType] = useState('tablet');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [supplierId, setSupplierId] = useState<string>('');

  const [suppliers, setSuppliers] = useState<SupplierDropdownItem[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch suppliers dropdown list
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!isOpen || !token) return;
      setLoadingSuppliers(true);
      try {
        const response = await fetch(`${API_BASE_URL}/suppliers/dropdown`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to load suppliers.');
        }
        const data = await response.json();
        setSuppliers(data);
      } catch (err: any) {
        console.error('Error fetching suppliers for dropdown:', err);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, [isOpen, token]);

  // Load medicine details when editing
  useEffect(() => {
    if (medicine) {
      setName(medicine.name || '');
      setGenericName(medicine.generic_name || '');
      setManufacturer(medicine.manufacturer || '');
      setDrugType(medicine.drug_type || 'tablet');
      setBatchNo(medicine.batch_no || '');
      setExpiryDate(medicine.expiry_date ? medicine.expiry_date.split('T')[0] : '');
      setQuantity(medicine.quantity !== undefined ? medicine.quantity.toString() : '0');
      setPurchasePrice(medicine.purchase_price !== undefined ? medicine.purchase_price.toString() : '');
      setSellingPrice(medicine.selling_price !== undefined ? medicine.selling_price.toString() : '');
      setSupplierId(medicine.supplier_id ? medicine.supplier_id.toString() : '');
    } else {
      setName('');
      setGenericName('');
      setManufacturer('');
      setDrugType('tablet');
      setBatchNo('');
      setExpiryDate('');
      setQuantity('0');
      setPurchasePrice('');
      setSellingPrice('');
      setSupplierId('');
    }
    setError(null);
  }, [medicine, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Medicine name is required.');
      return;
    }
    if (!purchasePrice || isNaN(Number(purchasePrice)) || Number(purchasePrice) < 0) {
      setError('Please enter a valid purchase price (>= 0).');
      return;
    }
    if (!sellingPrice || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      setError('Please enter a valid selling price (>= 0).');
      return;
    }
    if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      setError('Please enter a valid quantity (>= 0).');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      generic_name: genericName.trim() || null,
      manufacturer: manufacturer.trim() || null,
      drug_type: drugType,
      batch_no: batchNo.trim() || null,
      expiry_date: expiryDate || null,
      quantity: Math.floor(Number(quantity)),
      purchase_price: Number(purchasePrice),
      selling_price: Number(sellingPrice),
      supplier_id: supplierId ? Number(supplierId) : null,
    };

    try {
      const url = medicine
        ? `${API_BASE_URL}/medicines/${medicine.medicine_id}`
        : `${API_BASE_URL}/medicines`;
      const method = medicine ? 'PATCH' : 'POST';

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
            : errorData.message || 'Failed to save medicine.'
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

  const drugTypes = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'gel', label: 'Gel' },
    { value: 'powder', label: 'Powder' },
    { value: 'ointment', label: 'Ointment' },
    { value: 'drop', label: 'Drop' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }} // slightly wider for fields grid
      >
        <div className="modal-header">
          <h2>{medicine ? 'Edit Medicine' : 'Add Medicine'}</h2>
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
          {/* 1. Name (Full Width) */}
          <div className="form-group">
            <label className="form-label" htmlFor="medicine-name">
              Medicine Name *
            </label>
            <input
              id="medicine-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paracetamol 500mg"
              required
              disabled={submitting}
            />
          </div>

          {/* Grid for Generic Name & Manufacturer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="generic-name">
                Generic Name
              </label>
              <input
                id="generic-name"
                type="text"
                className="form-input"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Acetaminophen"
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="manufacturer">
                Manufacturer
              </label>
              <input
                id="manufacturer"
                type="text"
                className="form-input"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Pfizer"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Grid for Drug Type & Supplier */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="drug-type">
                Drug Type *
              </label>
              <select
                id="drug-type"
                className="form-input"
                style={{ height: '42px' }}
                value={drugType}
                onChange={(e) => setDrugType(e.target.value)}
                disabled={submitting}
              >
                {drugTypes.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="supplier-select">
                Supplier
              </label>
              <select
                id="supplier-select"
                className="form-input"
                style={{ height: '42px' }}
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={submitting || loadingSuppliers}
              >
                <option value="">-- No Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id.toString()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid for Batch No & Expiry Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="batch-no">
                Batch Number
              </label>
              <input
                id="batch-no"
                type="text"
                className="form-input"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                placeholder="e.g. BATCH123"
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="expiry-date">
                Expiry Date
              </label>
              <input
                id="expiry-date"
                type="date"
                className="form-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Grid for Quantity, Purchase Price, Selling Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="quantity">
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="purchase-price">
                Purchase Price ($) *
              </label>
              <input
                id="purchase-price"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                required
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="selling-price">
                Selling Price ($) *
              </label>
              <input
                id="selling-price"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                required
                disabled={submitting}
              />
            </div>
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
                'Save Medicine'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
