import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  EMR_MASTERS_CATALOG,
  getMasterData,
  saveMasterData,
  type MasterItem,
  type EmrMasterDefinition,
} from './emrMastersData';
import { alert } from '../utils/alert';
import { ConfirmModal } from '../ConfirmModal';

export const EmrMasterGenericScreen: React.FC<{ masterKeyOverride?: string }> = ({ masterKeyOverride }) => {
  const navigate = useNavigate();
  const params = useParams<{ masterKey?: string; legacyPath?: string }>();
  const activeKey = masterKeyOverride || params.masterKey || params.legacyPath || 'ros-symptoms';

  // Find matching master definition (either by key or legacyUrl)
  const masterDef: EmrMasterDefinition | undefined = useMemo(() => {
    return (
      EMR_MASTERS_CATALOG.find((m) => m.key === activeKey) ||
      EMR_MASTERS_CATALOG.find((m) => m.legacyUrl.toLowerCase() === activeKey.toLowerCase()) ||
      EMR_MASTERS_CATALOG[0]
    );
  }, [activeKey]);

  // Items state
  const [items, setItems] = useState<MasterItem[]>(() => getMasterData(masterDef.key));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal State (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [pendingDelete, setPendingDelete] = useState<MasterItem | null>(null);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(term),
        );
      }
      return true;
    });
  }, [items, searchTerm, statusFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    const initial: Record<string, any> = { status: 'Active' };
    masterDef.fields.forEach((f) => {
      initial[f.key] = f.type === 'select' && f.options ? f.options[0] : '';
    });
    setFormData(initial);
    setEditingItem(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: MasterItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = () => {
    for (const f of masterDef.fields) {
      if (f.required && (!formData[f.key] || !String(formData[f.key]).trim())) {
        alert.showErrorMsg(`Field "${f.label}" is required.`);
        return;
      }
    }

    if (editingItem) {
      // Update
      const updated = items.map((it) => (it.id === editingItem.id ? { ...it, ...formData } : it));
      setItems(updated);
      saveMasterData(masterDef.key, updated);
      alert.showSuccessMsg(`"${masterDef.title}" record updated successfully.`);
    } else {
      // Add
      const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
      const newItem: MasterItem = {
        id: nextId,
        description: formData.description || formData.name || '',
        status: formData.status || 'Active',
        ...formData,
      };
      const updated = [newItem, ...items];
      setItems(updated);
      saveMasterData(masterDef.key, updated);
      alert.showSuccessMsg(`New "${masterDef.title}" record added.`);
    }
    setModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    const updated = items.filter((it) => it.id !== pendingDelete.id);
    setItems(updated);
    saveMasterData(masterDef.key, updated);
    alert.showSuccessMsg('Record deleted successfully.');
    setPendingDelete(null);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '16px 24px', fontFamily: 'inherit' }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <button
            type="button"
            onClick={() => navigate('/emr/masters')}
            style={{
              background: 'none',
              border: 'none',
              color: '#3182ce',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: 0,
              marginBottom: 4,
            }}
          >
            <i className="fa-solid fa-arrow-left" /> Back to EMR Masters Hub
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: '#2d3748', fontWeight: 700 }}>
              {masterDef.title}
            </h2>
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 12,
                background: '#ebf8ff',
                color: '#2b6cb0',
                fontWeight: 700,
              }}
            >
              {masterDef.category}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            {masterDef.description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            background: '#2b6cb0',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 4px rgba(43,108,176,0.3)',
          }}
        >
          <i className="fa-solid fa-plus" /> Add New Record
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ position: 'relative', width: 320 }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ position: 'absolute', left: 10, top: 10, color: '#a0aec0', fontSize: 13 }}
          />
          <input
            type="text"
            placeholder="Search records…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>Status:</span>
          {(['All', 'Active', 'Inactive'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                border: 'none',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: statusFilter === st ? '#2b6cb0' : '#edf2f7',
                color: statusFilter === st ? '#fff' : '#4a5568',
              }}
            >
              {st}
            </button>
          ))}
          <span style={{ fontSize: 12, color: '#a0aec0', marginLeft: 8 }}>
            Total: {filteredItems.length} records
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0', color: '#4a5568' }}>
                {masterDef.columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '12px 14px',
                      textAlign: col.type === 'badge' ? 'center' : 'left',
                      width: col.width,
                      fontWeight: 700,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                <th style={{ padding: '12px 14px', textAlign: 'center', width: 110, fontWeight: 700 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={masterDef.columns.length + 1}
                    style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #edf2f7',
                      background: idx % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                  >
                    {masterDef.columns.map((col) => {
                      const val = item[col.key];
                      if (col.type === 'badge') {
                        const isActive = val === 'Active';
                        return (
                          <td key={col.key} style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 700,
                                background: isActive ? '#c6f6d5' : '#fed7d7',
                                color: isActive ? '#22543d' : '#742a2a',
                              }}
                            >
                              {val || 'Active'}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} style={{ padding: '10px 14px', color: '#2d3748' }}>
                          {val != null ? String(val) : '—'}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Record"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#3182ce',
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(item)}
                          title="Delete Record"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e53e3e',
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              width: 'min(500px, 94vw)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 20px',
                background: '#2b6cb0',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              <span>{editingItem ? `Edit ${masterDef.title}` : `Add New ${masterDef.title}`}</span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'grid', gap: 14, maxHeight: '70vh', overflowY: 'auto' }}>
              {masterDef.fields.map((f) => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4a5568', marginBottom: 4 }}>
                    {f.label} {f.required && <span style={{ color: '#e53e3e' }}>*</span>}
                  </label>

                  {f.type === 'select' ? (
                    <select
                      value={formData[f.key] || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e0',
                        fontSize: 13,
                        background: '#fff',
                      }}
                    >
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[f.key] || ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e0',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      value={formData[f.key] || ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e0',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                background: '#edf2f7',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  background: '#fff',
                  color: '#4a5568',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                style={{
                  padding: '7px 18px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#2b6cb0',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <ConfirmModal
          title="Delete Record"
          message={`Are you sure you want to delete "${pendingDelete.description || pendingDelete.name || pendingDelete.code || 'this record'}"?`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};
