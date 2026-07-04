import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { SupplierModal } from './SupplierModal';
import type { Supplier } from './SupplierModal';

export const Suppliers: React.FC = () => {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSuppliers = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/suppliers?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suppliers.');
      }

      const result = await response.json();
      setSuppliers(result.data);
      setTotal(result.meta.total);
      setLastPage(result.meta.last_page);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching suppliers.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, token]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Reset to first page on search
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete supplier.');
      }

      // If deleted successfully, refresh list
      if (suppliers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchSuppliers();
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
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
                placeholder="Search by name, email, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ height: '42px' }}>
              Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ height: '42px' }}
                onClick={handleClearSearch}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <button className="btn btn-primary" onClick={openAddModal} style={{ height: '42px' }}>
          <Plus size={18} />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Main content table */}
      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
            <p style={{ color: 'var(--text-secondary)' }}>Loading suppliers...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--danger)' }}>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchSuppliers} style={{ marginTop: '12px' }}>
              Retry
            </button>
          </div>
        ) : suppliers.length === 0 ? (
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
            <h3>No Suppliers Found</h3>
            <p style={{ maxWidth: '400px', fontSize: '0.9rem' }}>
              {search
                ? `No suppliers matched your search query "${search}". Try typing something else.`
                : 'Get started by creating your first supplier record to track pharmacy supply chains.'}
            </p>
            {!search && (
              <button className="btn btn-primary" onClick={openAddModal} style={{ marginTop: '12px' }}>
                <Plus size={16} /> Add Supplier
              </button>
            )}
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', flex: 1, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact No</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplier_id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{supplier.name}</td>
                    <td>{supplier.contact_no || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                    <td>{supplier.email || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                    <td>{supplier.address || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', height: '32px' }}
                          onClick={() => openEditModal(supplier)}
                          aria-label="Edit supplier"
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
                          onClick={() => handleDelete(supplier.supplier_id, supplier.name)}
                          disabled={deletingId === supplier.supplier_id}
                          aria-label="Delete supplier"
                        >
                          {deletingId === supplier.supplier_id ? (
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {!loading && suppliers.length > 0 && (
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
            of <strong>{total}</strong> suppliers
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
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSuppliers}
        supplier={selectedSupplier}
      />
    </div>
  );
};
