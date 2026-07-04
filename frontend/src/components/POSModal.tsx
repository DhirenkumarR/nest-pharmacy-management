import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Plus, Trash2, ShoppingCart, UserPlus, UserCheck, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export interface CustomerDropdownItem {
  customer_id: number;
  name: string;
}

export interface MedicineDropdownItem {
  medicine_id: number;
  name: string;
  generic_name: string | null;
  selling_price: number;
  quantity: number;
  batch_no: string | null;
  expiry_date: string | null;
}

export interface CartItem {
  medicine_id: number;
  name: string;
  generic_name: string | null;
  price: number;
  quantity: number;
  maxStock: number;
  batch_no: string | null;
}

interface POSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const POSModal: React.FC<POSModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();

  // Customer Toggle State: 'existing' | 'new'
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');

  // Inline New Customer Fields
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  // Selected Existing Customer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDropdownItem | null>(null);

  // Search-on-scroll states for Customers
  const [customers, setCustomers] = useState<CustomerDropdownItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [customerLastPage, setCustomerLastPage] = useState(1);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Search-on-scroll states for Medicines
  const [medicines, setMedicines] = useState<MedicineDropdownItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicinePage, setMedicinePage] = useState(1);
  const [medicineLastPage, setMedicineLastPage] = useState(1);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [isMedicineDropdownOpen, setIsMedicineDropdownOpen] = useState(false);

  // Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDropdownItem | null>(null);
  const [inputQuantity, setInputQuantity] = useState('1');

  // Submit States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const medicineDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
      if (medicineDropdownRef.current && !medicineDropdownRef.current.contains(e.target as Node)) {
        setIsMedicineDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch Customers Dropdown list
  const fetchCustomers = useCallback(async (searchVal: string, pageNum: number, append = false) => {
    if (!token || !isOpen) return;
    setLoadingCustomers(true);
    try {
      const qp = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });
      if (searchVal) {
        qp.append('search', searchVal);
      }

      const response = await fetch(`${API_BASE_URL}/customers/dropdown?${qp.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setCustomers((prev) => (append ? [...prev, ...result.data] : result.data));
        setCustomerLastPage(result.meta.last_page);
      }
    } catch (err) {
      console.error('Failed to load customers for dropdown', err);
    } finally {
      setLoadingCustomers(false);
    }
  }, [token, isOpen]);

  // Fetch Medicines Dropdown list
  const fetchMedicines = useCallback(async (searchVal: string, pageNum: number, append = false) => {
    if (!token || !isOpen) return;
    setLoadingMedicines(true);
    try {
      const qp = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });
      if (searchVal) {
        qp.append('search', searchVal);
      }

      const response = await fetch(`${API_BASE_URL}/medicines/dropdown?${qp.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setMedicines((prev) => (append ? [...prev, ...result.data] : result.data));
        setMedicineLastPage(result.meta.last_page);
      }
    } catch (err) {
      console.error('Failed to load medicines for dropdown', err);
    } finally {
      setLoadingMedicines(false);
    }
  }, [token, isOpen]);

  // Trigger search on typing (reset page to 1)
  useEffect(() => {
    if (isOpen) {
      fetchCustomers(customerSearch, 1, false);
      setCustomerPage(1);
    }
  }, [customerSearch, fetchCustomers, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchMedicines(medicineSearch, 1, false);
      setMedicinePage(1);
    }
  }, [medicineSearch, fetchMedicines, isOpen]);

  // Handle Scroll to load next page (infinite scrolling)
  const handleCustomerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 10 && !loadingCustomers && customerPage < customerLastPage) {
      const nextPage = customerPage + 1;
      setCustomerPage(nextPage);
      fetchCustomers(customerSearch, nextPage, true);
    }
  };

  const handleMedicineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 10 && !loadingMedicines && medicinePage < medicineLastPage) {
      const nextPage = medicinePage + 1;
      setMedicinePage(nextPage);
      fetchMedicines(medicineSearch, nextPage, true);
    }
  };

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setCart([]);
      setSelectedCustomer(null);
      setCustomerMode('existing');
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      setNewCustomerAddress('');
      setSelectedMedicine(null);
      setInputQuantity('1');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Add Item to Cart
  const handleAddItem = () => {
    if (!selectedMedicine) {
      setError('Please select a medicine product first.');
      return;
    }
    const qty = parseInt(inputQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }
    if (qty > selectedMedicine.quantity) {
      setError(`Requested quantity (${qty}) exceeds available stock (${selectedMedicine.quantity}) for ${selectedMedicine.name}.`);
      return;
    }

    const existingIdx = cart.findIndex((i) => i.medicine_id === selectedMedicine.medicine_id);
    if (existingIdx > -1) {
      const newQty = cart[existingIdx].quantity + qty;
      if (newQty > selectedMedicine.quantity) {
        setError(`Cumulative quantity (${newQty}) exceeds available stock (${selectedMedicine.quantity}).`);
        return;
      }
      const updated = [...cart];
      updated[existingIdx].quantity = newQty;
      setCart(updated);
    } else {
      setCart([...cart, {
        medicine_id: selectedMedicine.medicine_id,
        name: selectedMedicine.name,
        generic_name: selectedMedicine.generic_name,
        price: selectedMedicine.selling_price,
        quantity: qty,
        maxStock: selectedMedicine.quantity,
        batch_no: selectedMedicine.batch_no,
      }]);
    }

    // Reset select fields
    setSelectedMedicine(null);
    setInputQuantity('1');
    setError(null);
  };

  // Remove Item from Cart
  const handleRemoveItem = (id: number) => {
    setCart(cart.filter((item) => item.medicine_id !== id));
  };

  // Calculate Overall Cart Subtotal
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Submit checkout transaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Cart is empty. Please add at least one medicine item.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let finalCustomerId: number;

      // Mode A: Register New Customer First
      if (customerMode === 'new') {
        if (!newCustomerName.trim()) {
          throw new Error('New Customer Name is required.');
        }

        const customerPayload = {
          name: newCustomerName.trim(),
          contact_no: newCustomerPhone.trim() || null,
          email: newCustomerEmail.trim() || null,
          address: newCustomerAddress.trim() || null,
        };

        const custResponse = await fetch(`${API_BASE_URL}/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(customerPayload),
        });

        if (!custResponse.ok) {
          const errData = await custResponse.json();
          throw new Error(
            Array.isArray(errData.message)
              ? errData.message.join(', ')
              : errData.message || 'Failed to create customer.'
          );
        }

        const newCustomer = await custResponse.json();
        finalCustomerId = newCustomer.customer_id;
      } else {
        // Mode B: Use Selected Customer
        if (!selectedCustomer) {
          throw new Error('Please select an existing customer.');
        }
        finalCustomerId = selectedCustomer.customer_id;
      }

      // POST checkout sale transaction
      const salePayload = {
        customer_id: finalCustomerId,
        items: cart.map((i) => ({
          medicine_id: i.medicine_id,
          quantity: i.quantity,
        })),
      };

      const saleResponse = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(salePayload),
      });

      if (!saleResponse.ok) {
        const errData = await saleResponse.json();
        throw new Error(
          Array.isArray(errData.message)
            ? errData.message.join(', ')
            : errData.message || 'Failed to complete checkout.'
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during POS checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart style={{ color: 'var(--primary)' }} />
            <h2>New POS checkout Register</h2>
          </div>
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
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
          
          {/* LEFT: Customer selection / registration Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid var(--border-color)', paddingRight: '24px' }}>
            
            {/* Mode selection toggle */}
            <div>
              <label className="form-label">Customer Mode</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className={`btn ${customerMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setCustomerMode('existing');
                    setError(null);
                  }}
                  disabled={submitting}
                >
                  <UserCheck size={16} />
                  <span>Existing</span>
                </button>
                <button
                  type="button"
                  className={`btn ${customerMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setCustomerMode('new');
                    setError(null);
                  }}
                  disabled={submitting}
                >
                  <UserPlus size={16} />
                  <span>New Customer</span>
                </button>
              </div>
            </div>

            {customerMode === 'existing' ? (
              /* Search-on-scroll Existing Customer */
              <div className="form-group" style={{ position: 'relative' }} ref={customerDropdownRef}>
                <label className="form-label" htmlFor="customer-input">Choose Customer *</label>
                <input
                  id="customer-input"
                  type="text"
                  className="form-input"
                  placeholder="Type name to search..."
                  value={selectedCustomer ? selectedCustomer.name : customerSearch}
                  onChange={(e) => {
                    setSelectedCustomer(null);
                    setCustomerSearch(e.target.value);
                    setIsCustomerDropdownOpen(true);
                  }}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  disabled={submitting}
                />
                
                {isCustomerDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: 'var(--card-shadow)'
                  }} onScroll={handleCustomerScroll}>
                    {customers.map((c) => (
                      <div
                        key={c.customer_id}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)',
                          fontSize: '0.9rem',
                          color: 'var(--text-primary)',
                        }}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch('');
                          setIsCustomerDropdownOpen(false);
                        }}
                        className="dropdown-item-hover"
                      >
                        {c.name}
                      </div>
                    ))}
                    {loadingCustomers && (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      </div>
                    )}
                    {customers.length === 0 && !loadingCustomers && (
                      <div style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        No matches found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Inline Registration Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label className="form-label" htmlFor="new-cust-name">Name *</label>
                  <input
                    id="new-cust-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label className="form-label" htmlFor="new-cust-phone">Phone Number</label>
                  <input
                    id="new-cust-phone"
                    type="text"
                    className="form-input"
                    placeholder="e.g. +1 (555) 123-4567"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label className="form-label" htmlFor="new-cust-email">Email</label>
                  <input
                    id="new-cust-email"
                    type="email"
                    className="form-input"
                    placeholder="e.g. john@example.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label className="form-label" htmlFor="new-cust-addr">Address</label>
                  <input
                    id="new-cust-addr"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 100 Main St"
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Cart & Medicine selections panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. Add Medicine selection */}
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Add Products</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr auto', gap: '12px', alignItems: 'flex-end' }}>
                {/* Search Medicine */}
                <div style={{ position: 'relative' }} ref={medicineDropdownRef}>
                  <label className="form-label" htmlFor="pos-medicine">Medicine Name</label>
                  <input
                    id="pos-medicine"
                    type="text"
                    className="form-input"
                    placeholder="Search medicine..."
                    value={selectedMedicine ? selectedMedicine.name : medicineSearch}
                    onChange={(e) => {
                      setSelectedMedicine(null);
                      setMedicineSearch(e.target.value);
                      setIsMedicineDropdownOpen(true);
                    }}
                    onFocus={() => setIsMedicineDropdownOpen(true)}
                    disabled={submitting}
                  />

                  {isMedicineDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: 'var(--card-shadow)'
                    }} onScroll={handleMedicineScroll}>
                      {medicines.map((m) => (
                        <div
                          key={m.medicine_id}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-color)',
                            fontSize: '0.85rem',
                          }}
                          onClick={() => {
                            setSelectedMedicine(m);
                            setMedicineSearch('');
                            setIsMedicineDropdownOpen(false);
                          }}
                          className="dropdown-item-hover"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)' }}>
                            <span>{m.name}</span>
                            <span style={{ color: 'var(--primary)' }}>${m.selling_price.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            <span>Gen: {m.generic_name || '—'}</span>
                            <span style={{ color: m.quantity < 10 ? 'var(--danger)' : 'inherit' }}>Stock: {m.quantity}</span>
                          </div>
                        </div>
                      ))}
                      {loadingMedicines && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                      )}
                      {medicines.length === 0 && !loadingMedicines && (
                        <div style={{ padding: '10px 14px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                          No matches found.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="form-label" htmlFor="pos-qty">Qty</label>
                  <input
                    id="pos-qty"
                    type="number"
                    min="1"
                    className="form-input"
                    value={inputQuantity}
                    onChange={(e) => setInputQuantity(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Add button */}
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ height: '42px', padding: '0 16px' }}
                  onClick={handleAddItem}
                  disabled={submitting}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              {selectedMedicine && (
                <div style={{
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <strong>Unit Price:</strong> ${selectedMedicine.selling_price.toFixed(2)}
                  </div>
                  <div>
                    <strong>Batch:</strong> {selectedMedicine.batch_no || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: selectedMedicine.quantity < 10 ? 'var(--warning)' : 'inherit' }}>
                    {selectedMedicine.quantity < 10 && <AlertTriangle size={12} />}
                    <strong>Stock:</strong> {selectedMedicine.quantity}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Cart table */}
            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Cart Checklist</h3>
              <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table style={{ minWidth: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', fontSize: '0.75rem' }}>Medicine</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'right' }}>Subtotal</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.medicine_id}>
                        <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          {item.batch_no && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Batch: {item.batch_no}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '0.85rem', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', fontSize: '0.85rem', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 12px', fontSize: '0.85rem', textAlign: 'right', fontWeight: 600 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                            onClick={() => handleRemoveItem(item.medicine_id)}
                            disabled={submitting}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                          Checkout cart is currently empty.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Footer totals and checkout button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>Total Amount Due</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={submitting || cart.length === 0}
                  onClick={handleSubmit}
                  style={{ minWidth: '110px' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Registering...
                    </>
                  ) : (
                    'Complete Checkout'
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
