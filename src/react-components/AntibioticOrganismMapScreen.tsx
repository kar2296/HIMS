import React, { useState, useEffect, useCallback, useRef } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { Pagination } from '../components/ui/Pagination';
import { apiFetch } from './utils/api';

export interface MappedAntibioticItem {
  Id: number;
  OrganismMapId?: number;
  AntibioticMasterId?: number;
  AntibioticMaster?: {
    Id?: number;
    Code?: string;
    AntibioticName?: string;
    DisplayOrder?: number;
  };
  [key: string]: any;
}

export interface AntibioticOption {
  Id: number;
  Code: string;
  AntibioticName: string;
}

export interface AntibioticOrganismMapScreenProps {
  reactProps?: {
    organismId?: number;
    items?: MappedAntibioticItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const AntibioticOrganismMapScreen: React.FC<AntibioticOrganismMapScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));
  const organismId = reactProps?.organismId || 0;

  // Standalone list states
  const [standaloneItems, setStandaloneItems] = useState<MappedAntibioticItem[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Search & Select Antibiotic dropdown
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<AntibioticOption[]>([]);
  const [selectedAntibiotic, setSelectedAntibiotic] = useState<AntibioticOption | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useCallback((action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  }, [onAction]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch mapped antibiotics
  const fetchMappedItems = useCallback(async (page: number = 1, pageSize: number = 25) => {
    if (isHybrid || !organismId) return;
    setIsLoading(true);
    try {
      const res = await apiFetch({
        action: 'lis/AntibioticMaster/GetAntibioticOrganismMaps',
        data: {
          Params: [{ Key: 2, Value: organismId }],
          PageContext: { PageSize: pageSize, PageNumber: page },
        },
      });
      if (res && res.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
        setStandalonePage(page);
        setStandalonePageSize(pageSize);
      }
    } catch (e) {
      console.error('Failed to load antibiotic organism maps:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isHybrid, organismId]);

  useEffect(() => {
    if (!isHybrid) {
      fetchMappedItems(1, standalonePageSize);
    }
  }, [isHybrid, fetchMappedItems, standalonePageSize]);

  // Search Antibiotics for mapping
  const searchAntibiotics = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await apiFetch({
        action: 'lis/AntibioticMaster/GetAntibioticMasters',
        data: {
          Params: [
            { Key: 4, Value: 2 },
            { Key: 2, Value: query },
          ],
          PageContext: { PageSize: 50, PageNumber: 1 },
        },
      });
      if (res && res.Data) {
        setSearchResults(res.Data);
        setIsDropdownOpen(true);
      }
    } catch (e) {
      console.error('Error searching antibiotics:', e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    setSelectedAntibiotic(null);
    searchAntibiotics(val);
  };

  const handleSelectAntibiotic = (opt: AntibioticOption) => {
    setSelectedAntibiotic(opt);
    setSearchQuery(`${opt.Code} - ${opt.AntibioticName}`);
    setIsDropdownOpen(false);
    if (onAction) {
      dispatch('antibioticSelected', opt);
    }
  };

  const handleAddMapping = async () => {
    if (!selectedAntibiotic) {
      alert('Please select an antibiotic first.');
      return;
    }

    if (onAction) {
      dispatch('saveItem', {
        AntibioticMasterId: selectedAntibiotic.Id,
        AntibioticName: selectedAntibiotic.AntibioticName,
      });
      setSelectedAntibiotic(null);
      setSearchQuery('');
    } else {
      setIsSaving(true);
      try {
        await apiFetch({
          action: 'lis/AntibioticMaster/AddAntibioticOrganismMap',
          data: {
            Data: {
              OrganismMapId: organismId,
              AntibioticMasterId: selectedAntibiotic.Id,
            },
          },
        });
        setSelectedAntibiotic(null);
        setSearchQuery('');
        fetchMappedItems(1, standalonePageSize);
      } catch (e) {
        console.error('Failed to map antibiotic:', e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = (item: MappedAntibioticItem) => {
    if (onAction) {
      dispatch('delete', item);
    } else {
      if (confirm('Are you sure you want to delete this mapping?')) {
        apiFetch({
          action: 'lis/AntibioticOrganismMap/DeleteAntibioticOrganismMap',
          data: { Id: item.Id },
        }).then(() => fetchMappedItems(standalonePage, standalonePageSize));
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (onAction) {
      dispatch('pageChange', { page: newPage });
    } else {
      fetchMappedItems(newPage, standalonePageSize);
    }
  };

  const items = isHybrid ? (reactProps?.items || []) : standaloneItems;
  const totalItems = isHybrid ? (reactProps?.totalItems || 0) : standaloneTotal;
  const currentPage = isHybrid ? (reactProps?.currentPage || 1) : standalonePage;
  const pageSize = isHybrid ? (reactProps?.pageSize || 25) : standalonePageSize;

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        boxSizing: 'border-box',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {/* ── Add Mapping Bar ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          padding: `${spacing.md} ${spacing.lg}`,
          marginBottom: spacing.md,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 280, position: 'relative' }} ref={dropdownRef}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
            Select Antibiotic for Susceptibility Panel
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              background: '#f8fafc',
              padding: '0 12px',
              height: 38,
            }}
          >
            <i className="fas fa-search" style={{ color: colors.textMuted, marginRight: 8, fontSize: 13 }} />
            <input
              type="text"
              placeholder="Search antibiotic name or code..."
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownOpen(true);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: colors.textMain,
                width: '100%',
              }}
            />
            {isSearching && <i className="fas fa-spinner fa-spin" style={{ color: colors.primary, fontSize: 14 }} />}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                background: '#ffffff',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                boxShadow: shadows.lg,
                maxHeight: 220,
                overflowY: 'auto',
                zIndex: 1000,
              }}
            >
              {searchResults.map((opt) => (
                <div
                  key={opt.Id}
                  onClick={() => handleSelectAntibiotic(opt)}
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  <span style={{ fontWeight: 600, color: colors.textMain }}>{opt.AntibioticName}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#059669' }}>{opt.Code}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ paddingTop: 18 }}>
          <button
            type="button"
            disabled={!selectedAntibiotic || isSaving}
            onClick={handleAddMapping}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 38,
              padding: '0 18px',
              borderRadius: radii.md,
              border: 'none',
              background: selectedAntibiotic ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : '#cbd5e1',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: selectedAntibiotic ? 'pointer' : 'not-allowed',
              boxShadow: selectedAntibiotic ? '0 2px 6px rgba(5, 150, 105, 0.3)' : 'none',
            }}
          >
            <i className="fa fa-plus" />
            <span>Map Antibiotic</span>
          </button>
        </div>
      </div>

      {/* ── Mapped Table Card ── */}
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
                  Antibiotic Name
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Display Order
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted, textAlign: 'center', width: 80 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '36px 0', color: colors.textMuted }}>
                    <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: 10, display: 'block', color: colors.primary }} />
                    Loading Mapped Antibiotics...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: colors.textMuted }}>
                    <div style={{ fontSize: 32, color: '#cbd5e1', marginBottom: 10 }}>
                      <i className="fas fa-capsules" />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: colors.textMain }}>No Antibiotics Mapped Yet</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Use the selector above to link antibiotics to this organism.</div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => (
                  <tr
                    key={row.Id || idx}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fcfdfd')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#047857' }}>
                      {row.AntibioticMaster?.Code || row.Code || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: colors.textMain }}>
                      {row.AntibioticMaster?.AntibioticName || row.AntibioticName || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: colors.textMuted }}>
                      {row.AntibioticMaster?.DisplayOrder ?? row.DisplayOrder ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Delete Mapping"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: radii.sm,
                        }}
                      >
                        <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="Delete" style={{ width: 16, height: 16 }} />
                      </button>
                    </td>
                  </tr>
                ))
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
                <strong>{totalItems}</strong> mapped items
              </>
            ) : (
              '0 mapped items'
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
