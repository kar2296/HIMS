import React, { useState, useEffect, useCallback } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { Pagination } from '../components/ui/Pagination';
import { apiFetch } from './utils/api';

export interface AntibioticItem {
  Id: number;
  Code: string;
  AntibioticName: string;
  Mnemonic?: string;
  DisplayOrder?: number;
  AnbioticTypeId?: number;
  AntibioticType?: {
    Id?: number;
    Description?: string;
  };
  OrgIsolationId?: number;
  OrgIsolation?: {
    Id?: number;
    OrgIsolationName?: string;
  };
  ActiveStatusId?: number;
  ActiveStatus?: {
    Id?: number;
    Description?: string;
  };
  [key: string]: any;
}

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
}

export interface AntibioticMastersListScreenProps {
  reactProps?: {
    items?: AntibioticItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      codemnemonicsnamedesc?: string;
      Code?: string;
      MnemonicName?: string;
      AnbioticTypeId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      ActiveStatus?: LookupOption[];
      AntibioticType?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const AntibioticMastersListScreen: React.FC<AntibioticMastersListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));

  // Standalone state
  const [standaloneItems, setStandaloneItems] = useState<AntibioticItem[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    ActiveStatus: LookupOption[];
    AntibioticType: LookupOption[];
  }>({
    ActiveStatus: [],
    AntibioticType: [],
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>(
    reactProps?.currentfilter?.codemnemonicsnamedesc || reactProps?.currentfilter?.Code || ''
  );
  const [typeId, setTypeId] = useState<number>(reactProps?.currentfilter?.AnbioticTypeId ?? -1);
  const [statusId, setStatusId] = useState<number>(reactProps?.currentfilter?.ActiveStatusId ?? 2);

  // Sync props from AngularJS
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.codemnemonicsnamedesc !== undefined) {
        setSearchQuery(reactProps.currentfilter.codemnemonicsnamedesc);
      } else if (reactProps.currentfilter.Code !== undefined) {
        setSearchQuery(reactProps.currentfilter.Code);
      }
      if (reactProps.currentfilter.AnbioticTypeId !== undefined) {
        setTypeId(reactProps.currentfilter.AnbioticTypeId);
      }
      if (reactProps.currentfilter.ActiveStatusId !== undefined) {
        setStatusId(reactProps.currentfilter.ActiveStatusId);
      }
    }
  }, [reactProps?.currentfilter]);

  const dispatch = useCallback((action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  }, [onAction]);

  // Standalone API calls
  const fetchLookups = useCallback(async () => {
    try {
      const res = await apiFetch({
        action: 'General/Options/getoptions',
        data: [{ Key: 'ActiveStatus' }, { Key: 'AntibioticType' }],
      });
      if (res && typeof res === 'object') {
        setStandaloneLookups({
          ActiveStatus: Array.isArray(res.ActiveStatus) ? res.ActiveStatus : [],
          AntibioticType: Array.isArray(res.AntibioticType) ? res.AntibioticType : [],
        });
      }
    } catch (e) {
      console.error('Failed to fetch antibiotic lookups:', e);
    }
  }, []);

  const fetchItems = useCallback(async (page: number = 1, pageSize: number = 25) => {
    if (isHybrid) return;
    setIsLoading(true);
    try {
      const res = await apiFetch({
        action: 'lis/AntibioticMaster/GetAntibioticMasters',
        data: {
          Params: [
            { Key: 1, Value: searchQuery || '' },
            { Key: 2, Value: searchQuery || '' },
            { Key: 3, Value: typeId },
            { Key: 4, Value: statusId },
          ],
          PageContext: {
            PageSize: pageSize,
            PageNumber: page,
          },
        },
      });
      if (res && res.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
        setStandalonePage(page);
        setStandalonePageSize(pageSize);
      }
    } catch (e) {
      console.error('Failed to fetch antibiotics:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isHybrid, searchQuery, typeId, statusId]);

  useEffect(() => {
    if (!isHybrid) {
      fetchLookups();
      fetchItems(1, standalonePageSize);
    }
  }, [isHybrid, fetchLookups, fetchItems, standalonePageSize]);

  // Derived source of truth
  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems = isHybrid ? (reactProps?.totalItems || 0) : standaloneTotal;
  const currentPage = isHybrid ? (reactProps?.currentPage || 1) : standalonePage;
  const pageSize = isHybrid ? (reactProps?.pageSize || 25) : standalonePageSize;
  const antibioticTypes = isHybrid ? (reactProps?.lookup?.AntibioticType || []) : standaloneLookups.AntibioticType;
  const statuses = isHybrid ? (reactProps?.lookup?.ActiveStatus || []) : standaloneLookups.ActiveStatus;

  // Handlers
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onAction) {
      dispatch('search', {
        codemnemonicsnamedesc: searchQuery,
        Code: searchQuery,
        MnemonicName: searchQuery,
        AnbioticTypeId: typeId,
        ActiveStatusId: statusId,
      });
    } else {
      fetchItems(1, pageSize);
    }
  };

  const handleFilterChange = (filterType: 'type' | 'status', value: number) => {
    if (filterType === 'type') setTypeId(value);
    if (filterType === 'status') setStatusId(value);

    if (onAction) {
      dispatch('filterChange', {
        field: filterType,
        value,
        codemnemonicsnamedesc: searchQuery,
        Code: searchQuery,
        MnemonicName: searchQuery,
        AnbioticTypeId: filterType === 'type' ? value : typeId,
        ActiveStatusId: filterType === 'status' ? value : statusId,
      });
    } else {
      setTimeout(() => fetchItems(1, pageSize), 0);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (onAction) {
      dispatch('pageChange', { page: newPage });
    } else {
      fetchItems(newPage, pageSize);
    }
  };

  const handleAddNew = () => {
    dispatch('addNew');
  };

  const handleView = (item: AntibioticItem) => {
    dispatch('view', item);
  };

  const handleEdit = (item: AntibioticItem) => {
    dispatch('edit', item);
  };

  const handleDelete = (item: AntibioticItem) => {
    dispatch('delete', item);
  };

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '8px 16px',
      }}
    >
      {/* ── Top Header Card ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          padding: `${spacing.md} ${spacing.lg}`,
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
            }}
          >
            <i className="fas fa-pills" />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: colors.textMain,
                letterSpacing: -0.3,
              }}
            >
              Antibiotic Master
            </h2>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              Microbiology antibiotics catalogue and susceptibility profiling
            </div>
          </div>
        </div>

        {/* Search & Add New button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              padding: '0 12px',
              height: 38,
              minWidth: 260,
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fas fa-search" style={{ color: colors.textMuted, marginRight: 8, fontSize: 14 }} />
            <input
              type="text"
              id="pid"
              placeholder="Name / Code search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: colors.textMain,
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (onAction) dispatch('search', { codemnemonicsnamedesc: '', Code: '', MnemonicName: '', AnbioticTypeId: typeId, ActiveStatusId: statusId });
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <i className="fas fa-times" />
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={handleAddNew}
            title="Add Antibiotic"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 38,
              padding: '0 16px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <i className="fa fa-plus" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar Card ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: spacing.md,
          padding: `${spacing.md} ${spacing.lg}`,
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
          alignItems: 'center',
        }}
      >
        {/* Antibiotic Type */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
            Antibiotic Type
          </label>
          <select
            value={typeId}
            onChange={(e) => handleFilterChange('type', parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              height: 36,
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              padding: '0 10px',
              fontSize: 13,
              color: colors.textMain,
              background: '#f8fafc',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={-1}>All Types</option>
            {antibioticTypes.map((opt) => (
              <option key={opt.Id} value={opt.Id}>
                {opt.Text || opt.Description}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
            Status
          </label>
          <select
            value={statusId}
            onChange={(e) => handleFilterChange('status', parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              height: 36,
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              padding: '0 10px',
              fontSize: 13,
              color: colors.textMain,
              background: '#f8fafc',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={-1}>All Statuses</option>
            {statuses.map((opt) => (
              <option key={opt.Id} value={opt.Id}>
                {opt.Text || opt.Description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          marginBottom: spacing.md,
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: `2px solid ${colors.border}` }}>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Code
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Name
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Organism
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Mnemonic
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted, textAlign: 'center', width: 100 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: colors.textMuted }}>
                    <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: 12, display: 'block', color: colors.primary }} />
                    Loading Antibiotics...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: colors.textMuted }}>
                    <div style={{ fontSize: 36, color: '#cbd5e1', marginBottom: 12 }}>
                      <i className="fas fa-pills" />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: colors.textMain }}>No Antibiotics Found</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing the search query or changing filters.</div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const isActive = row.ActiveStatusId === 2 || row.ActiveStatus?.Description === 'Active';
                  return (
                    <tr
                      key={row.Id || idx}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fcfdfd')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#0369a1' }}>
                        {row.Code || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: colors.textMain }}>
                        {row.AntibioticName || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: colors.textMuted }}>
                        {row.OrgIsolation?.OrgIsolationName || row.OrgIsolationName || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: colors.textMuted }}>
                        {row.Mnemonic || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: radii.full,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                            background: isActive ? '#ecfdf5' : '#fef2f2',
                            color: isActive ? '#059669' : '#dc2626',
                            border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`,
                          }}
                        >
                          {row.ActiveStatus?.Description || (isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* View button */}
                          <button
                            type="button"
                            onClick={() => handleView(row)}
                            title="View Details"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: radii.sm,
                              color: '#0284c7',
                              fontSize: 14,
                            }}
                          >
                            <i className="fas fa-eye" />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleEdit(row)}
                            title="Edit Antibiotic"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: radii.sm,
                              color: '#2563eb',
                            }}
                          >
                            <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" style={{ width: 16, height: 16 }} />
                          </button>

                          {/* Delete button (for draft/inactive) */}
                          {row.ActiveStatusId === 1 && (
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              title="Delete Antibiotic"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                padding: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: radii.sm,
                                color: '#dc2626',
                              }}
                            >
                              <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="Delete" style={{ width: 16, height: 16 }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div
          style={{
            padding: `${spacing.md} ${spacing.lg}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing.md,
            background: '#ffffff',
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            {totalItems > 0 ? (
              <>
                Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> -{' '}
                <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
                <strong>{totalItems}</strong> items
              </>
            ) : (
              '0 items'
            )}
          </div>

          <Pagination
            totalItems={totalItems}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};
