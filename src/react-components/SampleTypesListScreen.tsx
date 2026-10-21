import React, { useState, useEffect, useCallback } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { Pagination } from '../components/ui/Pagination';
import { callBackendApi } from '../services/apiService';

export interface SampleTypeItem {
  Id: number;
  Code?: string;
  Name?: string;
  Description?: string;
  Mnemonics?: string;
  SampleCategoryId?: number;
  type?: number;
  SampleCategory?: {
    Id?: number;
    Description?: string;
  };
  ActiveStatusId?: number;
  IsActive?: boolean;
  ActiveStatus?: {
    Id?: number;
    Description?: string;
  };
  [key: string]: any;
}

export interface SampleTypesListScreenProps {
  reactProps?: {
    items?: SampleTypeItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      codemnemonicsnamedesc?: string;
      type?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      SampleCategory?: { Id: number; Text: string }[];
      ActiveStatus?: { Id: number; Text: string }[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onNavigate?: (stateName: string, params?: Record<string, any>) => void;
}

export const SampleTypesListScreen: React.FC<SampleTypesListScreenProps> = ({
  reactProps,
  onAction,
  onNavigate,
}) => {
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));

  const [standaloneItems, setStandaloneItems] = useState<SampleTypeItem[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>(
    reactProps?.currentfilter?.codemnemonicsnamedesc || ''
  );
  const [typeId, setTypeId] = useState<number>(reactProps?.currentfilter?.type ?? -1);
  const [statusId, setStatusId] = useState<number>(reactProps?.currentfilter?.ActiveStatusId ?? 2);

  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.codemnemonicsnamedesc !== undefined) {
        setSearchQuery(reactProps.currentfilter.codemnemonicsnamedesc);
      }
      if (reactProps.currentfilter.type !== undefined) {
        setTypeId(reactProps.currentfilter.type);
      }
      if (reactProps.currentfilter.ActiveStatusId !== undefined) {
        setStatusId(reactProps.currentfilter.ActiveStatusId);
      }
    }
  }, [reactProps?.currentfilter]);

  const fetchItems = useCallback(async (page: number, size: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const payload = {
        Params: [
          { Key: 1, Value: searchQuery || null },
          { Key: 2, Value: typeId !== -1 ? typeId : null },
          { Key: 3, Value: statusId }
        ],
        PageContext: {
          PageSize: size,
          PageNumber: page,
        }
      };

      const res = await callBackendApi('lis/sampletype/GetSampletypes', payload);
      const data = res?.data || res?.Data || res?.rows || [];
      const total = res?.PageContext?.TotalRecords || res?.total || (Array.isArray(data) ? data.length : 0);

      setStandaloneItems(Array.isArray(data) ? data : []);
      setStandaloneTotal(total);
    } catch (err: any) {
      console.error('Failed to load sample types:', err);
      setErrorMessage(err?.message || 'Failed to fetch sample types.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, typeId, statusId]);

  useEffect(() => {
    if (!isHybrid) {
      fetchItems(standalonePage, standalonePageSize);
    }
  }, [isHybrid, standalonePage, standalonePageSize, fetchItems]);

  const items: SampleTypeItem[] = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems: number = isHybrid ? (reactProps?.totalItems || 0) : standaloneTotal;
  const currentPage: number = isHybrid ? (reactProps?.currentPage || 1) : standalonePage;
  const pageSize: number = isHybrid ? (reactProps?.pageSize || 25) : standalonePageSize;

  const handleAddNew = () => {
    if (onAction) {
      onAction('add');
      return;
    }
    if (onNavigate) {
      onNavigate('app.sampletype', { id: 0 });
      return;
    }
    window.location.hash = '#/app/sampletype/0';
  };

  const handleEdit = (item: SampleTypeItem) => {
    if (onAction) {
      onAction('edit', item);
      return;
    }
    if (onNavigate) {
      onNavigate('app.sampletype', { id: item.Id });
      return;
    }
    window.location.hash = `#/app/sampletype/${item.Id}`;
  };

  const handleDelete = async (item: SampleTypeItem) => {
    if (!window.confirm(`Are you sure you want to delete specimen type "${item.Name || item.Code}"?`)) {
      return;
    }
    if (onAction) {
      onAction('delete', item);
      return;
    }
    try {
      await callBackendApi('lis/sampletype/DeleteSampletype', { Id: item.Id });
      fetchItems(currentPage, pageSize);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete sample type.');
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isHybrid && onAction) {
      onAction('filter', {
        codemnemonicsnamedesc: searchQuery,
        type: typeId,
        ActiveStatusId: statusId,
      });
    } else {
      setStandalonePage(1);
      fetchItems(1, pageSize);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (isHybrid && onAction) {
      onAction('page', newPage);
    } else {
      setStandalonePage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isHybrid && onAction) {
      onAction('pageSize', newSize);
    } else {
      setStandalonePageSize(newSize);
      setStandalonePage(1);
    }
  };

  return (
    <div
      style={{
        padding: spacing.lg,
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.md,
          background: '#ffffff',
          padding: `${spacing.md} ${spacing.lg}`,
          borderRadius: radii.xl,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.lg,
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
            }}
          >
            <i className="fas fa-microscope" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.textMain }}>
                Sample Types Master
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  background: '#ccfbf1',
                  color: '#0f766e',
                }}
              >
                Diagnostic Specimens
              </span>
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              Specimen catalog: Whole Blood, Serum, Plasma, Urine, CSF, Swabs, and Body Fluids
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            onClick={handleAddNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: radii.md,
              border: 'none',
              background: colors.primary,
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fa fa-plus" />
            <span>Add Sample Type</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          padding: spacing.md,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md,
            alignItems: 'end',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Search Code / Specimen Name / Mnemonic
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: '0 10px',
                height: 38,
              }}
            >
              <i className="fas fa-search" style={{ color: colors.textMuted, marginRight: 8, fontSize: 13 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Blood, Urine, Sputum, CSF..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 13,
                  width: '100%',
                  color: colors.textMain,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Status
            </label>
            <select
              value={statusId}
              onChange={(e) => setStatusId(Number(e.target.value))}
              style={{
                width: '100%',
                height: 38,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                background: '#f8fafc',
                fontSize: 13,
                color: colors.textMain,
              }}
            >
              <option value={-1}>All Statuses</option>
              <option value={2}>Active</option>
              <option value={1}>Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: spacing.sm }}>
            <button
              type="submit"
              style={{
                flex: 1,
                height: 38,
                borderRadius: radii.md,
                border: 'none',
                background: colors.primary,
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <i className="fas fa-filter" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Table Container ───────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
        }}
      >
        {errorMessage && (
          <div style={{ padding: spacing.md, background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>
            {errorMessage}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  background: '#f1f5f9',
                  borderBottom: `2px solid ${colors.border}`,
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                <th style={{ padding: '12px 16px', width: 48, textAlign: 'center' }}>#</th>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Specimen / Sample Name</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Mnemonic</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: colors.textMuted }}>
                    <i className="fas fa-spinner fa-spin fa-2x" style={{ color: colors.primary, marginBottom: 8 }} />
                    <div>Loading specimen types...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: colors.textMuted }}>
                    <i className="fas fa-microscope fa-3x" style={{ color: '#cbd5e1', marginBottom: 12, display: 'block' }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: colors.textMain }}>No sample types found</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Add a sample type to configure clinical laboratory specimens</div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const sNo = (currentPage - 1) * pageSize + idx + 1;
                  const isActive = row.ActiveStatusId === 2 || row.IsActive === true;

                  return (
                    <tr
                      key={row.Id || idx}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: colors.textMuted, fontWeight: 600 }}>
                        {sNo}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: colors.primary }}>
                        {row.Code || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: colors.textMain }}>{row.Name || '—'}</div>
                        {row.Description && (
                          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{row.Description}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                        {row.SampleCategory?.Description || row.CategoryName || 'General Laboratory'}
                      </td>
                      <td style={{ padding: '12px 16px', color: colors.textMuted }}>
                        {row.Mnemonics || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: radii.full,
                            fontSize: 11,
                            fontWeight: 700,
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleEdit(row)}
                            title="Edit Sample Type"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.md,
                              border: `1px solid ${colors.border}`,
                              background: '#ffffff',
                              color: colors.primary,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <i className="fas fa-edit" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            title="Delete Sample Type"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radii.md,
                              border: `1px solid ${colors.border}`,
                              background: '#ffffff',
                              color: '#dc2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            borderTop: `1px solid ${colors.border}`,
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            Showing{' '}
            <strong>
              {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(currentPage * pageSize, totalItems)}
            </strong>{' '}
            of <strong>{totalItems}</strong> records
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      </div>
    </div>
  );
};
