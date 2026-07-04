import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { MedicineModal } from './MedicineModal';
import type { Medicine, SupplierDropdownItem } from './MedicineModal';

export const Medicines: React.FC = () => {
  const { token } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter dropdown state
  const [suppliers, setSuppliers] = useState<SupplierDropdownItem[]>([]);
  
  // Search & Pagination & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDrugType, setSelectedDrugType] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch suppliers dropdown for the filter
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/suppliers/dropdown`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data);
        }
      } catch (err) {
        console.error('Failed to fetch suppliers for filter dropdown', err);
      }
    };
    fetchSuppliers();
  }, [token]);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        queryParams.append('search', search);
      }
      if (selectedDrugType) {
        queryParams.append('drug_type', selectedDrugType);
      }
      if (selectedSupplierId) {
        queryParams.append('supplier_id', selectedSupplierId);
      }

      const response = await fetch(`${API_BASE_URL}/medicines?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch medicines.');
      }

      const result = await response.json();
      setMedicines(result.data);
      setTotal(result.meta.total);
      setLastPage(result.meta.last_page);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching medicines.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedDrugType, selectedSupplierId, token]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedDrugType('');
    setSelectedSupplierId('');
    setPage(1);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete medicine "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete medicine.');
      }

      if (medicines.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchMedicines();
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setSelectedMedicine(null);
    setIsModalOpen(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  // Helper: Expiry Check
  const getExpiryStatus = (dateStr: string | null) => {
    if (!dateStr) return { label: '—', style: { color: 'var(--text-tertiary)' } };
    const expiry = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    if (expiry < today) {
      return { 
        label: 'Expired', 
        badgeClass: 'badge badge-danger', 
        dateText: expiry.toLocaleDateString(),
        isCritical: true 
      };
    } else if (expiry <= threeMonthsFromNow) {
      return { 
        label: 'Near Expiry', 
        badgeClass: 'badge badge-warning', 
        dateText: expiry.toLocaleDateString(),
        isWarning: true 
      };
    }
    return { 
      label: expiry.toLocaleDateString(), 
      badgeClass: '', 
      dateText: '' 
    };
  };

  // Helper: Stock Check
  const getStockStatus = (qty: number) => {
    if (qty === 0) {
      return <span className="badge badge-danger">Out of Stock</span>;
    } else if (qty < 10) {
      return (
        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} />
          Low Stock ({qty})
        </span>
      );
    }
    return <span className="badge badge-success">{qty} in stock</span>;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search and Filters Bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          {/* Text Search */}
          <div style={{ flex: '2 1 300px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Search Medicine</label>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
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
                className="form-input"
                style={{ paddingLeft: '38px', height: '42px' }}
                placeholder="Search by name, generic name, batch..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* Filter by Type */}
          <div style={{ flex: '1 1 150px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Drug Type</label>
            <select
              className="form-input"
              style={{ height: '42px' }}
              value={selectedDrugType}
              onChange={(e) => {
                setSelectedDrugType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Types</option>
              {drugTypes.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Supplier */}
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Supplier</label>
            <select
              className="form-input"
              style={{ height: '42px' }}
              value={selectedSupplierId}
              onChange={(e) => {
                setSelectedSupplierId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id.toString()}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-secondary" style={{ height: '42px' }}>
              Apply
            </button>
            {(search || selectedDrugType || selectedSupplierId) && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ height: '42px' }}
                onClick={handleClearFilters}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--text-secondary)' }}>
          {total} {total === 1 ? 'medicine' : 'medicines'} cataloged
        </h3>
        <button className="btn btn-primary" onClick={openAddModal} style={{ height: '42px' }}>
          <Plus size={18} />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              gap: '12px',
            }}
          >
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading medicines...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--danger)' }}>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchMedicines} style={{ marginTop: '12px' }}>
              Retry
            </button>
          </div>
        ) : medicines.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <h3>No Medicines Found</h3>
            <p style={{ maxWidth: '400px', fontSize: '0.9rem' }}>
              {search || selectedDrugType || selectedSupplierId
                ? 'No medicines matched your active filters. Try resetting search parameters.'
                : 'Get started by creating your first medicine product cataloged in inventory.'}
            </p>
            {!search && !selectedDrugType && !selectedSupplierId && (
              <button className="btn btn-primary" onClick={openAddModal} style={{ marginTop: '12px' }}>
                <Plus size={16} /> Add Medicine
              </button>
            )}
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Drug Type</th>
                  <th>Stock Level</th>
                  <th>Expiry Date</th>
                  <th>Purchase / Sell</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => {
                  const expiry = getExpiryStatus(medicine.expiry_date);
                  return (
                    <tr key={medicine.medicine_id}>
                      {/* Name / Gen Name / Manufacturer */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{medicine.name}</div>
                        {(medicine.generic_name || medicine.manufacturer) && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {medicine.generic_name && <span>{medicine.generic_name}</span>}
                            {medicine.generic_name && medicine.manufacturer && <span> &bull; </span>}
                            {medicine.manufacturer && <span>{medicine.manufacturer}</span>}
                          </div>
                        )}
                        {medicine.batch_no && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            Batch: {medicine.batch_no}
                          </div>
                        )}
                      </td>
                      
                      {/* Drug Type */}
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: 'var(--bg-tertiary)', 
                            color: 'var(--text-primary)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          {medicine.drug_type}
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td>{getStockStatus(medicine.quantity)}</td>

                      {/* Expiry Date */}
                      <td>
                        {expiry.badgeClass ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <span className={expiry.badgeClass}>{expiry.label}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{expiry.dateText}</span>
                          </div>
                        ) : (
                          <span style={expiry.style}>{expiry.label}</span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>P: </span>
                          <strong>${medicine.purchase_price.toFixed(2)}</strong>
                        </div>
                        <div style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>S: </span>
                          <strong style={{ color: 'var(--primary)' }}>${medicine.selling_price.toFixed(2)}</strong>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td>{medicine.supplier?.name || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', height: '32px' }}
                            onClick={() => openEditModal(medicine)}
                            aria-label="Edit medicine"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 10px',
                              height: '32px',
                              color: 'var(--danger)',
                            }}
                            onClick={() => handleDelete(medicine.medicine_id, medicine.name)}
                            disabled={deletingId === medicine.medicine_id}
                            aria-label="Delete medicine"
                          >
                            {deletingId === medicine.medicine_id ? (
                              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && medicines.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '4px 8px',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing{' '}
            <strong>
              {total === 0 ? 0 : (page - 1) * limit + 1} - {Math.min(page * limit, total)}
            </strong>{' '}
            of <strong>{total}</strong> medicines
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 12px', height: '36px' }}
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 12px', height: '36px' }}
              disabled={page >= lastPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <MedicineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMedicines}
        medicine={selectedMedicine}
      />
    </div>
  );
};
