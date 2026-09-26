import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card, FilterBar } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';
import { ConfirmModal } from './ConfirmModal';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CurrentFilter {
  DiagnosisName?: string;
  DiagnosisCodeSchemeId?: number;
  Code?: string;
  DiagnosisVersionId?: number;
  ActiveStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface DiagnosisRow {
  Id: number;
  Code?: string;
  DiagnosisName?: string;
  DiagnosisCodeSchemeId?: number;
  DiagnosisCodeScheme?: { Id?: number; Description?: string };
  DiagnosisVersionId?: number;
  DiagnosisVersion?: { Id?: number; Description?: string };
  LengthOfStay?: string | number;
  Description?: string;
  Synonym?: string;
  Comments?: string;
  ActiveStatusId?: number;
  ActiveStatus?: { Id?: number; Description?: string };
  IsActive?: boolean;
}

interface DiagnosisListScreenProps {
  reactProps?: {
    items?: DiagnosisRow[];
    pagerObj?: PagerObj;
    currentfilter?: CurrentFilter;
    lookup?: {
      DiagnosisCodeScheme?: LookupItem[];
      DiagnosisVersion?: LookupItem[];
      ActiveStatus?: LookupItem[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const DiagnosisListScreen: React.FC<DiagnosisListScreenProps> = ({ reactProps, onAction }) => {
  const [standaloneItems, setStandaloneItems] = useState<DiagnosisRow[]>([]);
  const [standaloneTotal, setStandaloneTotal] = useState<number>(0);
  const [standaloneLookups, setStandaloneLookups] = useState<{
    DiagnosisCodeScheme: LookupItem[];
    DiagnosisVersion: LookupItem[];
    ActiveStatus: LookupItem[];
  }>({ DiagnosisCodeScheme: [], DiagnosisVersion: [], ActiveStatus: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    items = standaloneItems,
    pagerObj = { totalItems: standaloneTotal, pageSize: 25, currentPage: 1 },
    currentfilter = {},
    lookup = standaloneLookups,
  } = reactProps || {};

  const schemeOptions = lookup?.DiagnosisCodeScheme || standaloneLookups.DiagnosisCodeScheme;
  const versionOptions = lookup?.DiagnosisVersion || standaloneLookups.DiagnosisVersion;
  const activeStatusOptions = lookup?.ActiveStatus || standaloneLookups.ActiveStatus;

  const [searchQuery, setSearchQuery] = useState(currentfilter.Code || currentfilter.DiagnosisName || '');
  const [schemeFilter, setSchemeFilter] = useState<number>(currentfilter.DiagnosisCodeSchemeId ?? -1);
  const [versionFilter, setVersionFilter] = useState<number>(currentfilter.DiagnosisVersionId ?? -1);
  const [statusFilter, setStatusFilter] = useState<number>(currentfilter.ActiveStatusId ?? 2);
  const [currentPage, setCurrentPage] = useState<number>(pagerObj.currentPage || 1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DiagnosisRow | null>(null);
  const [modalCode, setModalCode] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalSchemeId, setModalSchemeId] = useState<number | undefined>(undefined);
  const [modalVersionId, setModalVersionId] = useState<number | undefined>(undefined);
  const [modalDescription, setModalDescription] = useState('');
  const [modalSynonym, setModalSynonym] = useState('');
  const [modalLengthOfStay, setModalLengthOfStay] = useState('');
  const [modalComments, setModalComments] = useState('');
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Lookups for standalone mode
  useEffect(() => {
    if (!reactProps?.lookup) {
      import('../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: 'General/Options/getoptions',
          data: [
            { Key: 'DiagnosisCodeScheme' },
            { Key: 'DiagnosisVersion' },
            { Key: 'ActiveStatus' }
          ],
          type: 'post'
        }).then((res: any) => {
          if (res) {
            setStandaloneLookups({
              DiagnosisCodeScheme: res.DiagnosisCodeScheme || [],
              DiagnosisVersion: res.DiagnosisVersion || [],
              ActiveStatus: res.ActiveStatus || []
            });
          }
        }).catch(err => {
          console.error('Error fetching Diagnosis lookups:', err);
        });
      });
    }
  }, [reactProps?.lookup]);

  // Fetch data for standalone mode
  const fetchData = async (query = searchQuery, scheme = schemeFilter, version = versionFilter, status = statusFilter, page = currentPage) => {
    setIsLoading(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const params: any[] = [
        { Key: 1, Value: query },
        { Key: 2, Value: scheme },
        { Key: 3, Value: query },
        { Key: 4, Value: version },
        { Key: 5, Value: status }
      ];
      const res: any = await callBackendApi({
        action: 'clinicalmaster/diagnosis/GetDiagnosiss',
        data: {
          Params: params,
          PageContext: { PageSize: 25, PageNumber: page }
        },
        type: 'post'
      });
      if (res?.Data) {
        setStandaloneItems(res.Data);
        setStandaloneTotal(res.PageContext?.TotalRecords || res.Data.length);
      }
    } catch (err) {
      console.error('Error loading diagnoses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!reactProps?.items) {
      fetchData();
    }
  }, [reactProps?.items]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(searchQuery, schemeFilter, versionFilter, statusFilter, 1);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalCode('');
    setModalName('');
    setModalSchemeId(schemeOptions[0]?.Id || 1);
    setModalVersionId(versionOptions[0]?.Id || 1);
    setModalDescription('');
    setModalSynonym('');
    setModalLengthOfStay('');
    setModalComments('');
    setModalIsActive(true);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleEdit = (row: DiagnosisRow) => {
    setEditingItem(row);
    setModalCode(row.Code || '');
    setModalName(row.DiagnosisName || '');
    setModalSchemeId(row.DiagnosisCodeSchemeId ?? row.DiagnosisCodeScheme?.Id ?? (schemeOptions[0]?.Id || 1));
    setModalVersionId(row.DiagnosisVersionId ?? row.DiagnosisVersion?.Id ?? (versionOptions[0]?.Id || 1));
    setModalDescription(row.Description || '');
    setModalSynonym(row.Synonym || '');
    setModalLengthOfStay(row.LengthOfStay ? row.LengthOfStay.toString() : '');
    setModalComments(row.Comments || '');
    setModalIsActive(row.IsActive ?? (row.ActiveStatusId === 2));
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!modalCode.trim() || !modalName.trim()) {
      setModalError('Diagnosis Code and Diagnosis Name are required.');
      return;
    }
    setModalError('');
    setIsSaving(true);
    try {
      const { callBackendApi } = await import('../services/apiService');
      const payload: any = {
        Code: modalCode.trim(),
        DiagnosisName: modalName.trim(),
        DiagnosisCodeSchemeId: modalSchemeId ? Number(modalSchemeId) : (schemeOptions[0]?.Id || 1),
        DiagnosisVersionId: modalVersionId ? Number(modalVersionId) : (versionOptions[0]?.Id || 1),
        Description: modalDescription.trim(),
        Synonym: modalSynonym.trim(),
        LengthOfStay: modalLengthOfStay.trim() ? Number(modalLengthOfStay) : undefined,
        Comments: modalComments.trim(),
        IsActive: modalIsActive,
        ActiveStatusId: modalIsActive ? 2 : 1
      };

      if (editingItem?.Id) {
        payload.Id = editingItem.Id;
        await callBackendApi({
          action: 'clinicalmaster/diagnosis/UpdateDiagnosis',
          data: { Data: payload },
          type: 'post'
        });
      } else {
        await callBackendApi({
          action: 'clinicalmaster/diagnosis/AddDiagnosis',
          data: { Data: payload },
          type: 'post'
        });
      }

      setIsModalOpen(false);
      fetchData(searchQuery, schemeFilter, versionFilter, statusFilter, currentPage);
    } catch (err: any) {
      console.error('Error saving diagnosis:', err);
      setModalError(err.message || 'Failed to save diagnosis.');
    } finally {
      setIsSaving(false);
    }
  };

  const [itemToDelete, setItemToDelete] = useState<DiagnosisRow | null>(null);

  const handleDelete = (row: DiagnosisRow) => {
    setItemToDelete(row);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { callBackendApi } = await import('../services/apiService');
      await callBackendApi({
        action: 'clinicalmaster/diagnosis/DeleteDiagnosis',
        data: { Id: itemToDelete.Id },
        type: 'post'
      });
      setItemToDelete(null);
      fetchData(searchQuery, schemeFilter, versionFilter, statusFilter, currentPage);
    } catch (err) {
      console.error('Error deleting diagnosis:', err);
      alert('Failed to delete diagnosis.');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px`, color: colors.textMain }}>
      <PageHeader
        title="Diagnosis Master"
        actions={
          <Button
            id="btnAddNewDiagnosis"
            variant="primary"
            onClick={handleAddNew}
            style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}
          >
            <i className="fa fa-plus" aria-hidden="true" />
            Add New
          </Button>
        }
      />

      <Card style={{ marginBottom: spacing.md, padding: spacing.md }}>
        <FilterBar>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-end', width: '100%' }}>
            {/* Search Code or Name */}
            <div style={{ minWidth: 220, flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Diagnosis Code / Name
              </label>
              <Input
                id="filterDiagnosisSearch"
                placeholder="Search code or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Code Scheme Filter */}
            <div style={{ minWidth: 180 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Code Scheme
              </label>
              <Select
                id="filterDiagnosisScheme"
                value={schemeFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setSchemeFilter(num);
                  fetchData(searchQuery, num, versionFilter, statusFilter, 1);
                }}
                options={[
                  { value: '-1', label: 'All Schemes' },
                  ...schemeOptions.map(s => ({ value: s.Id.toString(), label: s.Text }))
                ]}
              />
            </div>

            {/* Version Filter */}
            <div style={{ minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Version
              </label>
              <Select
                id="filterDiagnosisVersion"
                value={versionFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setVersionFilter(num);
                  fetchData(searchQuery, schemeFilter, num, statusFilter, 1);
                }}
                options={[
                  { value: '-1', label: 'All Versions' },
                  ...versionOptions.map(v => ({ value: v.Id.toString(), label: v.Text }))
                ]}
              />
            </div>

            {/* Status Filter */}
            <div style={{ minWidth: 150 }}>
              <label style={{ display: 'block', fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs }}>
                Status
              </label>
              <Select
                id="filterDiagnosisStatus"
                value={statusFilter.toString()}
                onChange={(val) => {
                  const num = Number(val);
                  setStatusFilter(num);
                  fetchData(searchQuery, schemeFilter, versionFilter, num, 1);
                }}
                options={[
                  { value: '-1', label: 'All Status' },
                  ...activeStatusOptions.map(s => ({ value: s.Id.toString(), label: s.Text }))
                ]}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button id="btnSearchDiagnosis" variant="primary" onClick={handleSearch}>
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSchemeFilter(-1);
                  setVersionFilter(-1);
                  setStatusFilter(2);
                  fetchData('', -1, -1, 2, 1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </FilterBar>
      </Card>

      {/* Grid Card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} id="tableDiagnoses">
            <thead>
              <tr style={{ backgroundColor: colors.surfaceSunken, borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Code</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Diagnosis Name</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Scheme / Version</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Length of Stay</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center', fontWeight: 600, width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    Loading diagnoses...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: spacing.xl, color: colors.textMuted }}>
                    No diagnoses found.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.Id}
                    style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.primary }}>{row.Code || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>{row.DiagnosisName || '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>
                      {row.DiagnosisCodeScheme?.Description || row.DiagnosisVersion?.Description || '-'}
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>{row.LengthOfStay ? `${row.LengthOfStay} days` : '-'}</td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}` }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 500,
                          backgroundColor: row.ActiveStatusId === 2 ? '#e6f4ea' : '#fce8e6',
                          color: row.ActiveStatusId === 2 ? '#137333' : '#c5221f'
                        }}
                      >
                        {row.ActiveStatus?.Description || (row.ActiveStatusId === 2 ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: `${spacing.sm} ${spacing.md}`, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.xs }}>
                        <button
                          className="btnEditDiagnosis"
                          onClick={() => handleEdit(row)}
                          title="Edit"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: colors.primary,
                            padding: 4
                          }}
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                        </button>
                        <button
                          className="btnDeleteDiagnosis"
                          onClick={() => handleDelete(row)}
                          title="Delete"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d93025',
                            padding: 4
                          }}
                        >
                          <i className="fa fa-trash" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: spacing.md, borderTop: `1px solid ${colors.border}` }}>
          <Pagination
            currentPage={currentPage}
            totalItems={pagerObj.totalItems || standaloneTotal}
            pageSize={pagerObj.pageSize || 25}
            onPageChange={(page) => {
              setCurrentPage(page);
              fetchData(searchQuery, schemeFilter, versionFilter, statusFilter, page);
            }}
          />
        </div>
      </Card>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          id="modalDiagnosis"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              width: '100%',
              maxWidth: 580,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {editingItem ? 'Edit Diagnosis' : 'Add Diagnosis'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: colors.textMuted
                }}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: spacing.lg, maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
              {modalError && (
                <div
                  id="diagnosisValidationAlert"
                  style={{
                    padding: spacing.sm,
                    marginBottom: spacing.md,
                    backgroundColor: '#fce8e6',
                    color: '#c5221f',
                    borderRadius: 4,
                    fontSize: 13
                  }}
                >
                  {modalError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div style={{ display: 'flex', gap: spacing.md }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                      Diagnosis Code <span style={{ color: '#d93025' }}>*</span>
                    </label>
                    <Input
                      id="txtDiagnosisCode"
                      value={modalCode}
                      onChange={(e) => setModalCode(e.target.value)}
                      placeholder="e.g. A00.0 / J06.9"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                      Code Scheme
                    </label>
                    <Select
                      id="ddlDiagnosisScheme"
                      value={modalSchemeId ? modalSchemeId.toString() : ''}
                      onChange={(val) => setModalSchemeId(Number(val))}
                      options={schemeOptions.map(s => ({ value: s.Id.toString(), label: s.Text }))}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Diagnosis Name <span style={{ color: '#d93025' }}>*</span>
                  </label>
                  <Input
                    id="txtDiagnosisName"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="e.g. Acute upper respiratory infection"
                  />
                </div>

                <div style={{ display: 'flex', gap: spacing.md }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                      Version
                    </label>
                    <Select
                      id="ddlDiagnosisVersion"
                      value={modalVersionId ? modalVersionId.toString() : ''}
                      onChange={(val) => setModalVersionId(Number(val))}
                      options={versionOptions.map(v => ({ value: v.Id.toString(), label: v.Text }))}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                      Length of Stay (Days)
                    </label>
                    <Input
                      id="txtDiagnosisLengthOfStay"
                      type="number"
                      value={modalLengthOfStay}
                      onChange={(e) => setModalLengthOfStay(e.target.value)}
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Alias / Synonym
                  </label>
                  <Input
                    id="txtDiagnosisSynonym"
                    value={modalSynonym}
                    onChange={(e) => setModalSynonym(e.target.value)}
                    placeholder="Common clinical synonym"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Description
                  </label>
                  <Input
                    id="txtDiagnosisDescription"
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="Clinical definition or remarks"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: spacing.xs }}>
                    Comments
                  </label>
                  <textarea
                    id="txtDiagnosisComments"
                    value={modalComments}
                    onChange={(e) => setModalComments(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      borderRadius: 4,
                      border: `1px solid ${colors.border}`,
                      fontSize: 13,
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Special instructions or clinical guidelines"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <input
                    type="checkbox"
                    id="chkDiagnosisIsActive"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                  />
                  <label htmlFor="chkDiagnosisIsActive" style={{ fontSize: 13, cursor: 'pointer' }}>
                    Active Status
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: spacing.sm,
                backgroundColor: colors.surfaceSunken
              }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setModalCode('');
                  setModalName('');
                  setModalDescription('');
                  setModalSynonym('');
                  setModalLengthOfStay('');
                  setModalComments('');
                  setModalIsActive(true);
                }}
              >
                Clear
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                id="btnSaveDiagnosis"
                variant="primary"
                onClick={handleSaveModal}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save & Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Delete Diagnosis"
          message={`Are you sure you want to delete "${itemToDelete.DiagnosisName}" (${itemToDelete.Code})?`}
          yesLabel="Delete"
          noLabel="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
          onClose={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
};
