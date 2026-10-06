import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface DepartmentListItem {
  Id: number;
  DepartmentCode: string;
  DepartmentName: string;
  Description?: string;
  DepartmentTypeId?: number;
  ParentDepartmentId?: number;
  FacilityId?: number;
  ActiveStatusId?: number;
  IsActive?: boolean;
  ParentDepartment?: {
    Id: number;
    DepartmentName: string;
  };
  Facility?: {
    Id: number;
    FacilityName: string;
  };
  DepartmentType?: {
    Id: number;
    Description: string;
  };
  ActiveStatus?: {
    Id: number;
    Description: string;
  };
  [key: string]: any;
}

export interface DepartmentsListScreenProps {
  reactProps?: {
    items?: DepartmentListItem[];
    totalItems?: number;
    pageSize?: number;
    currentPage?: number;
    lookup?: {
      DepartmentType?: Array<{ Id: number; Text: string }>;
      ActiveStatus?: Array<{ Id: number; Text: string }>;
      Department?: Array<{ Id: number; Text: string }>;
      Facility?: Array<{ Id: number; Text: string }>;
      Speciality?: Array<{ Id: number; Text: string }>;
      CostCenter?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    currentfilter?: {
      CodeName?: string;
      ParentDepartmentId?: number;
      FacilityId?: number;
      departmenttypeid?: number;
      ActiveStatusId?: number;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const DepartmentsListScreen: React.FC<DepartmentsListScreenProps> = ({
  reactProps,
  onAction
}) => {
  const [items, setItems] = useState<DepartmentListItem[]>(reactProps?.items || []);
  const [totalItems, setTotalItems] = useState(reactProps?.totalItems || 0);
  const [currentPage, setCurrentPage] = useState(reactProps?.currentPage || 1);
  const [pageSize, setPageSize] = useState(reactProps?.pageSize || 25);
  const [loading, setLoading] = useState(false);

  // Filters
  const [codeName, setCodeName] = useState(reactProps?.currentfilter?.CodeName || '');
  const [parentDeptId, setParentDeptId] = useState<number | ''>(reactProps?.currentfilter?.ParentDepartmentId ?? '');
  const [facilityId, setFacilityId] = useState<number | ''>(reactProps?.currentfilter?.FacilityId ?? '');
  const [deptTypeId, setDeptTypeId] = useState<number | ''>(reactProps?.currentfilter?.departmenttypeid ?? '');
  const [activeStatusId, setActiveStatusId] = useState<number | ''>(reactProps?.currentfilter?.ActiveStatusId ?? 2);

  // Advanced Filter Modal
  const [showAdvFilter, setShowAdvFilter] = useState(false);
  const [advSpecialityId, setAdvSpecialityId] = useState<number | ''>('');
  const [advCostCenterId, setAdvCostCenterId] = useState<number | ''>('');
  const [advPhoneNo, setAdvPhoneNo] = useState('');
  const [advIsEmergency, setAdvIsEmergency] = useState(false);
  const [advIsAdmittingDept, setAdvIsAdmittingDept] = useState(false);

  // Lookups
  const [lookups, setLookups] = useState<{
    DepartmentType: Array<{ Id: number; Text: string }>;
    ActiveStatus: Array<{ Id: number; Text: string }>;
    Department: Array<{ Id: number; Text: string }>;
    Facility: Array<{ Id: number; Text: string }>;
    Speciality: Array<{ Id: number; Text: string }>;
    CostCenter: Array<{ Id: number; Text: string }>;
  }>({
    DepartmentType: reactProps?.lookup?.DepartmentType || [],
    ActiveStatus: reactProps?.lookup?.ActiveStatus || [],
    Department: reactProps?.lookup?.Department || [],
    Facility: reactProps?.lookup?.Facility || [],
    Speciality: reactProps?.lookup?.Speciality || [],
    CostCenter: reactProps?.lookup?.CostCenter || []
  });

  // Action dispatcher
  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  // Load Lookups
  useEffect(() => {
    let isMounted = true;
    const fetchLookups = async () => {
      try {
        const res = await apiFetch('General/Options/getoptions', [
          { Key: 'DepartmentType' },
          { Key: 'ActiveStatus' },
          { Key: 'Speciality' },
          { Key: 'CostCenter' },
          { Key: 'Facility', Request: { Params: [{ Key: 12, Value: 1 }] } },
          { Key: 'Department', Request: { Params: [{ Key: 4, Value: true }] } }
        ]);

        if (isMounted && res) {
          setLookups({
            DepartmentType: res.DepartmentType || [],
            ActiveStatus: res.ActiveStatus || [],
            Department: res.Department || [],
            Facility: res.Facility || [],
            Speciality: res.Speciality || [],
            CostCenter: res.CostCenter || []
          });
        }
      } catch (e) {
        console.warn('Could not load department lookups', e);
      }
    };

    if (!lookups.DepartmentType.length) {
      fetchLookups();
    }
    return () => { isMounted = false; };
  }, []);

  // Fetch Departments
  const fetchDepartments = useCallback(async (page = currentPage, size = pageSize) => {
    setLoading(true);
    try {
      const payload = {
        Params: [
          { Key: 1, Value: codeName || '' },
          { Key: 2, Value: '' },
          { Key: 3, Value: deptTypeId !== '' ? deptTypeId : -1 },
          { Key: 5, Value: activeStatusId !== '' ? activeStatusId : -1 },
          { Key: 6, Value: advSpecialityId !== '' ? advSpecialityId : -1 },
          { Key: 7, Value: advPhoneNo || '' },
          { Key: 12, Value: advCostCenterId !== '' ? advCostCenterId : -1 },
          { Key: 6, Value: parentDeptId !== '' ? parentDeptId : -1 },
          { Key: 14, Value: facilityId !== '' ? facilityId : -1 }
        ],
        PageContext: {
          PageSize: size,
          PageNumber: page
        }
      };

      const res = await apiFetch('SystemSettings/department/GetDepartments', payload);
      if (res && res.Data) {
        setItems(res.Data);
        setTotalItems(res.PageContext?.TotalRecords || res.Data.length);
      }
    } catch (err) {
      console.error('Failed to fetch departments', err);
    } finally {
      setLoading(false);
    }
  }, [codeName, deptTypeId, activeStatusId, parentDeptId, facilityId, advSpecialityId, advPhoneNo, advCostCenterId, currentPage, pageSize]);

  useEffect(() => {
    fetchDepartments(1, pageSize);
    setCurrentPage(1);
  }, [codeName, deptTypeId, activeStatusId, parentDeptId, facilityId, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchDepartments(newPage, pageSize);
  };

  const handleAddNew = () => {
    if (onAction) {
      dispatch('addNew');
    } else {
      window.location.hash = '#/app/dept';
    }
  };

  const handleEdit = (dept: DepartmentListItem) => {
    if (onAction) {
      dispatch('handleEvents', { actionType: 'edit', entity: dept });
    } else {
      window.location.hash = `#/app/dept?id=${dept.Id}`;
    }
  };

  const handleView = (dept: DepartmentListItem) => {
    if (onAction) {
      dispatch('handleEvents', { actionType: 'view', entity: dept });
    } else {
      window.location.hash = `#/app/dept?id=${dept.Id}`;
    }
  };

  const handleDelete = async (dept: DepartmentListItem) => {
    if (onAction) {
      dispatch('handleEvents', { actionType: 'delete', entity: dept });
      return;
    }

    if (window.confirm(`Are you sure you want to delete department "${dept.DepartmentName}"?`)) {
      try {
        await apiFetch('SystemSettings/department/DeleteDepartment', { Id: dept.Id });
        fetchDepartments(currentPage, pageSize);
      } catch (e) {
        console.error('Delete department failed', e);
      }
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const headerStyle: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: colors.textBody,
    background: colors.surfaceMuted,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap'
  };

  const cellStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontSize: '13px',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textMain
  };

  const filterSelectStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 10px',
    fontSize: '12px',
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ fontFamily: typography.fontFamily, color: colors.textBody }}>
      {/* 1. Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          marginBottom: spacing.md,
          paddingBottom: spacing.sm,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <i className="fa fa-sitemap" style={{ color: colors.primary, fontSize: 20 }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: colors.textMain }}>
              Departments
            </h3>
            <span style={{ fontSize: 12, color: colors.textMuted }}>
              Manage clinical, administrative, and diagnostic hospital departments.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {/* Quick Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search code / name..."
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
              style={{
                padding: '7px 12px 7px 32px',
                fontSize: '12px',
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                width: 220,
                outline: 'none'
              }}
            />
            <i
              className="fa fa-search"
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textSubtle,
                fontSize: 12
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvFilter(!showAdvFilter)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: showAdvFilter ? colors.primaryLight : 'transparent',
              color: showAdvFilter ? colors.primary : colors.textBody,
              border: `1px solid ${showAdvFilter ? colors.primaryMid : colors.border}`,
              borderRadius: radii.md,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <i className="fa fa-filter" />
            <span>Advanced</span>
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: colors.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: radii.md,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(37,99,235,0.2)'
            }}
          >
            <i className="fa fa-plus" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* 2. Top Filter Toolbar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: spacing.md,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          padding: spacing.md,
          marginBottom: spacing.md,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
            Parent Department
          </label>
          <select
            style={filterSelectStyle}
            value={parentDeptId ?? ''}
            onChange={(e) => setParentDeptId(e.target.value ? parseInt(e.target.value, 10) : '')}
          >
            <option value="">All Parent Departments</option>
            {lookups.Department.map((d) => (
              <option key={d.Id} value={d.Id}>{d.Text}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
            Facility
          </label>
          <select
            style={filterSelectStyle}
            value={facilityId ?? ''}
            onChange={(e) => setFacilityId(e.target.value ? parseInt(e.target.value, 10) : '')}
          >
            <option value="">All Facilities</option>
            {lookups.Facility.map((f) => (
              <option key={f.Id} value={f.Id}>{f.Text}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
            Department Type
          </label>
          <select
            style={filterSelectStyle}
            value={deptTypeId ?? ''}
            onChange={(e) => setDeptTypeId(e.target.value ? parseInt(e.target.value, 10) : '')}
          >
            <option value="">All Types</option>
            {lookups.DepartmentType.map((dt) => (
              <option key={dt.Id} value={dt.Id}>{dt.Text}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
            Status
          </label>
          <select
            style={filterSelectStyle}
            value={activeStatusId ?? ''}
            onChange={(e) => setActiveStatusId(e.target.value ? parseInt(e.target.value, 10) : '')}
          >
            <option value="">All Statuses</option>
            {lookups.ActiveStatus.map((st) => (
              <option key={st.Id} value={st.Id}>{st.Text}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filter Collapse */}
      {showAdvFilter && (
        <div
          style={{
            background: colors.surfaceMuted,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Speciality
            </label>
            <select
              style={filterSelectStyle}
              value={advSpecialityId ?? ''}
              onChange={(e) => setAdvSpecialityId(e.target.value ? parseInt(e.target.value, 10) : '')}
            >
              <option value="">All Specialities</option>
              {lookups.Speciality.map((s) => (
                <option key={s.Id} value={s.Id}>{s.Text}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Cost Center
            </label>
            <select
              style={filterSelectStyle}
              value={advCostCenterId ?? ''}
              onChange={(e) => setAdvCostCenterId(e.target.value ? parseInt(e.target.value, 10) : '')}
            >
              <option value="">All Cost Centers</option>
              {lookups.CostCenter.map((c) => (
                <option key={c.Id} value={c.Id}>{c.Text}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>
              Phone Number
            </label>
            <input
              type="text"
              style={filterSelectStyle}
              placeholder="e.g. 080..."
              value={advPhoneNo}
              onChange={(e) => setAdvPhoneNo(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 18 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={advIsEmergency}
                onChange={(e) => setAdvIsEmergency(e.target.checked)}
              />
              <span>Is Emergency</span>
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={advIsAdmittingDept}
                onChange={(e) => setAdvIsAdmittingDept(e.target.checked)}
              />
              <span>Is Admitting</span>
            </label>
          </div>
        </div>
      )}

      {/* 3. Data Grid Table */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: spacing.md
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ ...headerStyle, width: '12%' }}>Code</th>
                <th style={{ ...headerStyle, width: '24%' }}>Department Name</th>
                <th style={{ ...headerStyle, width: '20%' }}>Parent Department</th>
                <th style={{ ...headerStyle, width: '18%' }}>Facility</th>
                <th style={{ ...headerStyle, width: '14%' }}>Type</th>
                <th style={{ ...headerStyle, width: '12%' }}>Status</th>
                <th style={{ ...headerStyle, width: '10%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary }} />
                    <div style={{ marginTop: 8, fontSize: 13 }}>Loading departments...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: colors.textMuted }}>
                    <i className="fa fa-sitemap fa-2x" style={{ color: colors.borderStrong, marginBottom: 8 }} />
                    <div>No departments found.</div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const isActive = row.ActiveStatusId === 1 || row.IsActive;
                  return (
                    <tr
                      key={row.Id}
                      style={{
                        background: idx % 2 === 0 ? colors.surface : colors.surfaceMuted,
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = colors.primaryLight)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? colors.surface : colors.surfaceMuted)}
                    >
                      <td style={{ ...cellStyle, fontWeight: 600 }}>{row.DepartmentCode}</td>
                      <td style={{ ...cellStyle, fontWeight: 500 }}>{row.DepartmentName}</td>
                      <td style={cellStyle}>
                        {row.ParentDepartment?.DepartmentName || '—'}
                      </td>
                      <td style={cellStyle}>
                        {row.Facility?.FacilityName || 'All Facilities'}
                      </td>
                      <td style={cellStyle}>
                        <span
                          style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '3px 8px',
                            borderRadius: radii.md,
                            fontSize: 11,
                            fontWeight: 500
                          }}
                        >
                          {row.DepartmentType?.Description || 'General'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#166534' : '#991b1b',
                            padding: '3px 9px',
                            borderRadius: radii.full,
                            fontSize: 11,
                            fontWeight: 600
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#22c55e' : '#ef4444' }} />
                          <span>{row.ActiveStatus?.Description || (isActive ? 'Active' : 'Inactive')}</span>
                        </span>
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleEdit(row)}
                            title="Edit Department"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: colors.primary,
                              cursor: 'pointer',
                              padding: 4
                            }}
                          >
                            <i className="fa fa-pencil" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleView(row)}
                            title="View Department"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: colors.textMuted,
                              cursor: 'pointer',
                              padding: 4
                            }}
                          >
                            <i className="fa fa-eye" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            title="Delete Department"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: 4
                            }}
                          >
                            <i className="fa fa-trash" />
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
      </div>

      {/* 4. Pagination Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          padding: `${spacing.sm} 0`,
          fontSize: 12,
          color: colors.textMuted
        }}
      >
        <div>
          Showing {items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} departments
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => handlePageChange(currentPage - 1)}
            style={{
              padding: '6px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              background: '#fff',
              fontSize: 12,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>

          <span style={{ padding: '6px 10px', fontWeight: 600, color: colors.textMain }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => handlePageChange(currentPage + 1)}
            style={{
              padding: '6px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              background: '#fff',
              fontSize: 12,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
