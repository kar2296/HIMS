import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmModal } from './ConfirmModal';
import { NoteTemplateFormModal } from './NoteTemplateFormModal';
import { VoiceTranslatorModal } from './VoiceTranslatorModal';
import { apiFetch } from './utils/api';

export interface NoteTemplateItem {
  Id: number;
  Code: string;
  TemplateName: string;
  NoteTypeId?: number;
  NoteType?: {
    Id?: number;
    Description?: string;
  };
  NoteTypeDesc?: string;
  DepartmentId?: number;
  Department?: {
    Id?: number;
    DepartmentName?: string;
  };
  DepartmentName?: string;
  SubDepartmentId?: number;
  ActiveStatusId?: number;
  ActiveStatus?: {
    Id?: number;
    Description?: string;
  };
  DataTemplate?: string;
  [key: string]: any;
}

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
  DepartmentName?: string;
}

export interface NoteTemplatesListScreenProps {
  reactProps?: {
    items?: NoteTemplateItem[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    currentfilter?: {
      Code?: string;
      NoteTypeId?: number;
      DepartmentId?: number;
      ActiveStatusId?: number;
    };
    lookup?: {
      NoteType?: LookupOption[];
      Department?: LookupOption[];
      SubDepartment?: LookupOption[];
      ActiveStatus?: LookupOption[];
    };
    tempType?: string;
    context?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const NoteTemplatesListScreen: React.FC<NoteTemplatesListScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isHybrid = Boolean(reactProps && Array.isArray(reactProps.items));

  // Standalone list state
  const [standaloneItems, setStandaloneItems] = useState<NoteTemplateItem[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standalonePage, setStandalonePage] = useState<number>(1);
  const [standalonePageSize, setStandalonePageSize] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Lookups state
  const [lookups, setLookups] = useState<{
    NoteType: LookupOption[];
    Department: LookupOption[];
    SubDepartment?: LookupOption[];
    ActiveStatus: LookupOption[];
  }>({
    NoteType: reactProps?.lookup?.NoteType || [],
    Department: reactProps?.lookup?.Department || [],
    SubDepartment: reactProps?.lookup?.SubDepartment || [],
    ActiveStatus: reactProps?.lookup?.ActiveStatus || [],
  });

  // Filters state
  const [codeFilter, setCodeFilter] = useState<string>(reactProps?.currentfilter?.Code || '');
  const [noteTypeId, setNoteTypeId] = useState<number>(reactProps?.currentfilter?.NoteTypeId ?? -1);
  const [deptId, setDeptId] = useState<number>(reactProps?.currentfilter?.DepartmentId ?? -1);
  const [statusId, setStatusId] = useState<number>(reactProps?.currentfilter?.ActiveStatusId ?? -1);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(0);
  const [selectedTemplateData, setSelectedTemplateData] = useState<NoteTemplateItem | null>(null);

  // Standalone Voice Translator Modal state (from header quick launcher)
  const [isHeaderVoiceTranslatorOpen, setIsHeaderVoiceTranslatorOpen] = useState<boolean>(false);

  // Preview Modal state
  const [previewItem, setPreviewItem] = useState<NoteTemplateItem | null>(null);

  // Delete Confirm Modal state
  const [deleteItem, setDeleteItem] = useState<NoteTemplateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 3000);
  };

  // Sync props from AngularJS bridge if updated
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.Code !== undefined) setCodeFilter(reactProps.currentfilter.Code);
      if (reactProps.currentfilter.NoteTypeId !== undefined) setNoteTypeId(reactProps.currentfilter.NoteTypeId);
      if (reactProps.currentfilter.DepartmentId !== undefined) setDeptId(reactProps.currentfilter.DepartmentId);
      if (reactProps.currentfilter.ActiveStatusId !== undefined) setStatusId(reactProps.currentfilter.ActiveStatusId);
    }
    if (reactProps?.lookup) {
      setLookups((prev) => ({
        ...prev,
        NoteType: reactProps.lookup?.NoteType || prev.NoteType,
        Department: reactProps.lookup?.Department || prev.Department,
        SubDepartment: reactProps.lookup?.SubDepartment || prev.SubDepartment,
        ActiveStatus: reactProps.lookup?.ActiveStatus || prev.ActiveStatus,
      }));
    }
  }, [reactProps]);

  const dispatch = useCallback((action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  }, [onAction]);

  // Fetch Lookups
  const fetchLookups = useCallback(async () => {
    try {
      const res = await apiFetch('General/Options/getoptions', [
        { Key: 'Department' },
        { Key: 'ActiveStatus' },
        { Key: 'NoteType' },
        { Key: 'SubDepartment' },
      ]);
      if (res && typeof res === 'object') {
        setLookups({
          NoteType: Array.isArray(res.NoteType) ? res.NoteType : [],
          Department: Array.isArray(res.Department) ? res.Department : [],
          SubDepartment: Array.isArray(res.SubDepartment) ? res.SubDepartment : [],
          ActiveStatus: Array.isArray(res.ActiveStatus) ? res.ActiveStatus : [],
        });
      }
    } catch (e) {
      console.warn('Failed to fetch lookups:', e);
    }
  }, []);

  // Fetch List Items
  const fetchItems = useCallback(async (page: number = 1, pageSize: number = 25) => {
    setIsLoading(true);
    try {
      const res = await apiFetch('clinicalmaster/NoteTemplate/GetNoteTemplates', {
        Params: [
          { Key: 1, Value: noteTypeId },
          { Key: 2, Value: codeFilter || '' },
          { Key: 3, Value: deptId },
          { Key: 4, Value: statusId },
        ],
        PageContext: {
          PageSize: pageSize,
          PageNumber: page,
        },
      });

      if (res && res.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
        setStandalonePage(page);
        setStandalonePageSize(pageSize);
      }
    } catch (e) {
      console.error('Failed to fetch note templates:', e);
    } finally {
      setIsLoading(false);
    }
  }, [noteTypeId, codeFilter, deptId, statusId]);

  useEffect(() => {
    fetchLookups();
    fetchItems(1, standalonePageSize);
  }, [fetchLookups, fetchItems, standalonePageSize]);

  // Determine current items to display
  const items = isHybrid && reactProps?.items ? reactProps.items : standaloneItems;
  const totalItems = isHybrid && reactProps?.totalItems !== undefined ? reactProps.totalItems : standaloneTotal;
  const currentPage = isHybrid && reactProps?.currentPage ? reactProps.currentPage : standalonePage;
  const pageSize = isHybrid && reactProps?.pageSize ? reactProps.pageSize : standalonePageSize;

  // Stats calculation
  const activeCount = useMemo(() => {
    return items.filter((i) => i.ActiveStatusId === 2 || i.ActiveStatus?.Description === 'Active' || i.IsActive === true).length;
  }, [items]);

  // Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onAction) {
      dispatch('search', { Code: codeFilter, NoteTypeId: noteTypeId, DepartmentId: deptId, ActiveStatusId: statusId });
    }
    fetchItems(1, pageSize);
  };

  // Filter change
  const handleFilterChange = (type: 'noteType' | 'department' | 'status', value: number) => {
    if (type === 'noteType') setNoteTypeId(value);
    if (type === 'department') setDeptId(value);
    if (type === 'status') setStatusId(value);

    if (onAction) {
      dispatch('filterChange', {
        field: type,
        value,
        Code: codeFilter,
        NoteTypeId: type === 'noteType' ? value : noteTypeId,
        DepartmentId: type === 'department' ? value : deptId,
        ActiveStatusId: type === 'status' ? value : statusId,
      });
    }

    setTimeout(() => {
      fetchItems(1, pageSize);
    }, 10);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setCodeFilter('');
    setNoteTypeId(-1);
    setDeptId(-1);
    setStatusId(-1);
    if (onAction) {
      dispatch('search', { Code: '', NoteTypeId: -1, DepartmentId: -1, ActiveStatusId: -1 });
    }
    setTimeout(() => {
      fetchItems(1, pageSize);
    }, 10);
  };

  const handlePageChange = (newPage: number) => {
    if (onAction) {
      dispatch('pageChange', { page: newPage });
    }
    fetchItems(newPage, pageSize);
  };

  // Open Form Modal for Create New
  const handleAddNew = () => {
    setSelectedTemplateId(0);
    setSelectedTemplateData(null);
    setIsFormModalOpen(true);
    dispatch('addNew');
  };

  // Open Form Modal for Edit
  const handleEdit = (item: NoteTemplateItem) => {
    setSelectedTemplateId(item.Id);
    setSelectedTemplateData(item);
    setIsFormModalOpen(true);
    dispatch('edit', item);
  };

  // Duplicate / Clone Template
  const handleDuplicate = (item: NoteTemplateItem) => {
    setSelectedTemplateId(0);
    setSelectedTemplateData({
      ...item,
      Id: 0,
      Code: (item.Code || 'TEMP') + '_COPY',
      TemplateName: (item.TemplateName || 'Template') + ' (Copy)',
    });
    setIsFormModalOpen(true);
    showToast(`Cloning template "${item.TemplateName}"`, 'info');
  };

  // Delete Template Confirm Execution
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await apiFetch('clinicalmaster/NoteTemplate/DeleteNoteTemplate', { Id: deleteItem.Id });
      showToast(`Template "${deleteItem.TemplateName || deleteItem.Code}" deleted successfully.`, 'success');
      setDeleteItem(null);
      fetchItems(currentPage, pageSize);
      dispatch('delete', deleteItem);
    } catch (e: any) {
      console.error('Delete failed:', e);
      showToast(e?.message || 'Failed to delete template.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const isMedical = reactProps?.tempType === 'medical';
  const pageTitle = isMedical ? 'Discharge Summary Templates' : 'Clinical Note Templates';

  return (
    <div
      style={{
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 20px',
      }}
    >
      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 10070,
            backgroundColor:
              toastMessage.type === 'error' ? '#ef4444' : toastMessage.type === 'info' ? '#0284c7' : '#10b981',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: radii.full,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: shadows.lg,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <i
            className={`fas fa-${
              toastMessage.type === 'error'
                ? 'exclamation-circle'
                : toastMessage.type === 'info'
                ? 'info-circle'
                : 'check-circle'
            }`}
          />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Top Header Card ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          padding: `${spacing.md} ${spacing.xl}`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
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
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <i className="fas fa-file-medical-alt" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: colors.textMain,
                  letterSpacing: -0.3,
                }}
              >
                {pageTitle}
              </h2>
              <span
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                React 19 &bull; EMR Clinical Master
              </span>
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              Clinical note templates, findings documentation, and multilingual speech translation
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          {/* Quick Voice Translator Tool Launcher */}
          <button
            id="btn-voice-translator-header"
            type="button"
            onClick={() => setIsHeaderVoiceTranslatorOpen(true)}
            title="Open Live Multilingual Voice Translator"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
              padding: '0 16px',
              borderRadius: radii.lg,
              border: '1px solid #0284c7',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              color: '#0369a1',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(2, 132, 199, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.15)';
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                boxShadow: '0 0 6px #0284c7',
              }}
            />
            <i className="fas fa-microphone-alt" />
            <span>Voice Translator</span>
          </button>

          {/* Add New Template Button */}
          <button
            id="btn-add-new-template"
            type="button"
            onClick={handleAddNew}
            title="Create New Clinical Note Template"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 40,
              padding: '0 18px',
              borderRadius: radii.lg,
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 5px 14px rgba(37, 99, 235, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(37, 99, 235, 0.3)';
            }}
          >
            <i className="fa fa-plus" />
            <span>Add New Template</span>
          </button>

          {/* Home / Back Button */}
          <button
            id="btn-nav-home"
            type="button"
            onClick={() => dispatch('home')}
            title="Return to Clinical Dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: radii.lg,
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: colors.textMuted,
              cursor: 'pointer',
              fontSize: 15,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <i className="fas fa-home" />
          </button>
        </div>
      </div>

      {/* ── Filter Bar Card ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1.8fr) repeat(3, minmax(180px, 1fr)) auto',
          gap: spacing.md,
          padding: `${spacing.md} ${spacing.xl}`,
          background: '#ffffff',
          borderRadius: radii.xl,
          boxShadow: shadows.sm,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
          alignItems: 'flex-end',
        }}
      >
        {/* Search Input */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase' }}>
            Search Code or Template
          </label>
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
            }}
          >
            <i className="fas fa-search" style={{ color: colors.textMuted, marginRight: 8, fontSize: 13 }} />
            <input
              type="text"
              placeholder="Search by code or keyword..."
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: colors.textMain,
                width: '100%',
              }}
            />
            {codeFilter && (
              <button
                type="button"
                onClick={() => {
                  setCodeFilter('');
                  fetchItems(1, pageSize);
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
        </div>

        {/* Template Type Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase' }}>
            Template Type
          </label>
          <select
            value={noteTypeId}
            onChange={(e) => handleFilterChange('noteType', parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              height: 38,
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
            <option value={-1}>All Types ({lookups.NoteType.length})</option>
            {lookups.NoteType.map((opt) => (
              <option key={opt.Id} value={opt.Id}>
                {opt.Text || opt.Description}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase' }}>
            Department
          </label>
          <select
            value={deptId}
            onChange={(e) => handleFilterChange('department', parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              height: 38,
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
            <option value={-1}>All Departments</option>
            {lookups.Department.map((opt) => (
              <option key={opt.Id} value={opt.Id}>
                {opt.Text || opt.DepartmentName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 5, textTransform: 'uppercase' }}>
            Status
          </label>
          <select
            value={statusId}
            onChange={(e) => handleFilterChange('status', parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              height: 38,
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
            <option value={2}>Active Only</option>
            <option value={1}>Inactive Only</option>
          </select>
        </div>

        {/* Reset Filters */}
        <div>
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset All Filters"
            style={{
              height: 38,
              padding: '0 14px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: '#f8fafc',
              color: colors.textMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fas fa-undo" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: radii.xl,
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
                <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Template Type
                </th>
                <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Template Code
                </th>
                <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Template Name
                </th>
                <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Department
                </th>
                <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted }}>
                  Status
                </th>
                <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: colors.textMuted, textAlign: 'center', width: 140 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '50px 0', color: colors.textMuted }}>
                    <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: 12, display: 'block', color: colors.primary }} />
                    Loading Note Templates...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
                    <div style={{ fontSize: 42, color: '#cbd5e1', marginBottom: 14 }}>
                      <i className="fas fa-folder-open" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: colors.textMain }}>No Note Templates Found</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      Click <strong>Add New Template</strong> above to create your first clinical note template.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const isActive =
                    row.ActiveStatusId === 2 ||
                    row.ActiveStatus?.Description === 'Active' ||
                    row.IsActive === true;

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
                      {/* Type */}
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: colors.textMain }}>
                        {row.NoteType?.Description || row.NoteTypeDesc || '—'}
                      </td>

                      {/* Code */}
                      <td style={{ padding: '14px 18px', fontSize: 13 }}>
                        <span
                          style={{
                            fontFamily: 'Consolas, monospace',
                            fontWeight: 700,
                            color: '#0369a1',
                            backgroundColor: '#e0f2fe',
                            padding: '3px 8px',
                            borderRadius: radii.sm,
                            border: '1px solid #bae6fd',
                          }}
                        >
                          {row.Code || '—'}
                        </span>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: colors.textMain }}>
                        {row.TemplateName || '—'}
                      </td>

                      {/* Department */}
                      <td style={{ padding: '14px 18px', fontSize: 13, color: colors.textMuted }}>
                        {row.Department?.DepartmentName || row.DepartmentName || '—'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
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
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* Preview Action */}
                          <button
                            id={`btn-preview-template-${row.Id}`}
                            type="button"
                            onClick={() => setPreviewItem(row)}
                            title="Preview Template Content"
                            style={{
                              border: 'none',
                              background: '#eff6ff',
                              color: '#2563eb',
                              cursor: 'pointer',
                              width: 30,
                              height: 30,
                              borderRadius: radii.md,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <i className="fas fa-eye" />
                          </button>

                          {/* Edit Action */}
                          <button
                            id={`btn-edit-template-${row.Id}`}
                            type="button"
                            onClick={() => handleEdit(row)}
                            title="Edit Note Template"
                            style={{
                              border: 'none',
                              background: '#f0fdf4',
                              color: '#059669',
                              cursor: 'pointer',
                              width: 30,
                              height: 30,
                              borderRadius: radii.md,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <i className="fas fa-pen" />
                          </button>

                          {/* Duplicate Action */}
                          <button
                            id={`btn-duplicate-template-${row.Id}`}
                            type="button"
                            onClick={() => handleDuplicate(row)}
                            title="Duplicate / Clone Template"
                            style={{
                              border: 'none',
                              background: '#f8fafc',
                              color: colors.textMuted,
                              cursor: 'pointer',
                              width: 30,
                              height: 30,
                              borderRadius: radii.md,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <i className="fas fa-copy" />
                          </button>

                          {/* Delete Action */}
                          <button
                            id={`btn-delete-template-${row.Id}`}
                            type="button"
                            onClick={() => setDeleteItem(row)}
                            title="Delete Template"
                            style={{
                              border: 'none',
                              background: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              width: 30,
                              height: 30,
                              borderRadius: radii.md,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              transition: 'all 0.15s ease',
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

        {/* ── Pagination Footer ── */}
        <div
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
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
                <strong>{totalItems}</strong> templates ({activeCount} active)
              </>
            ) : (
              '0 templates'
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

      {/* ── React Note Template Form Modal ── */}
      <NoteTemplateFormModal
        isOpen={isFormModalOpen}
        templateId={selectedTemplateId}
        initialData={selectedTemplateData}
        lookups={lookups}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={(saved) => {
          showToast(`Template "${saved.TemplateName || saved.Code}" saved successfully!`, 'success');
          fetchItems(currentPage, pageSize);
          if (onAction) dispatch('search', { Code: codeFilter });
        }}
      />

      {/* ── Quick Voice Translator Modal (from Header Launcher) ── */}
      <VoiceTranslatorModal
        isOpen={isHeaderVoiceTranslatorOpen}
        onClose={() => setIsHeaderVoiceTranslatorOpen(false)}
        onInsertAtCursor={(text) => {
          navigator.clipboard.writeText(text);
          showToast('Copied dictated translation to clipboard! Open a template to insert.', 'info');
        }}
        onAppendToTemplate={(text) => {
          navigator.clipboard.writeText(text);
          showToast('Copied dictated translation to clipboard! Open a template to insert.', 'info');
        }}
        onReplaceTemplate={(text) => {
          navigator.clipboard.writeText(text);
          showToast('Copied dictated translation to clipboard! Open a template to insert.', 'info');
        }}
      />

      {/* ── Preview Modal ── */}
      {previewItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
            boxSizing: 'border-box',
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '840px',
              maxHeight: '88vh',
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.xl}`,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  {previewItem.TemplateName}
                </h3>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                  Code: <strong>{previewItem.Code}</strong> &bull; Type: <strong>{previewItem.NoteType?.Description || 'N/A'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = previewItem;
                    setPreviewItem(null);
                    handleEdit(itemToEdit);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: radii.md,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-pen" style={{ marginRight: 6 }} />
                  Edit Template
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#ffffff',
                    fontSize: 18,
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>

            {/* Rendered HTML */}
            <div
              style={{
                padding: spacing.xl,
                overflowY: 'auto',
                flex: 1,
                fontSize: 14,
                lineHeight: 1.6,
                color: colors.textMain,
              }}
              dangerouslySetInnerHTML={{
                __html: previewItem.DataTemplate || '<p style="color:#94a3b8; font-style:italic">This template has no body content.</p>',
              }}
            />

            {/* Footer */}
            <div
              style={{
                padding: `${spacing.sm} ${spacing.xl}`,
                backgroundColor: '#f8fafc',
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                style={{
                  padding: '7px 18px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#ffffff',
                  color: colors.textMain,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        isOpen={Boolean(deleteItem)}
        title="Delete Note Template"
        message={`Are you sure you want to delete note template "${deleteItem?.TemplateName || deleteItem?.Code}"? This action cannot be undone.`}
        yesLabel={isDeleting ? 'Deleting...' : 'Delete Template'}
        noLabel="Cancel"
        variant="danger"
        icon="fas fa-trash-alt"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteItem(null)}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  );
};

export default NoteTemplatesListScreen;
