import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface RolePrivilegeItem {
  Id?: number;
  RoleId?: number;
  FacilityId?: number;
  AccessObjectTypeId: number;
  AccessObjectType: string;
  PrivilegeActionId: number;
  AccessAction: string;
  Access: 'allow' | 'deny';
  ActiveStatusId?: number;
  Facility?: {
    FacilityName: string;
  };
}

export interface GroupedPrivilege {
  AccessObjectTypeId: number;
  PrivilegeType: string;
  FacilityName?: string;
  FacilityId?: number;
  ActiveStatusId?: number;
  actions: Array<{
    Id?: number;
    PrivilegeActionId: number;
    AccessAction: string;
    Access: 'allow' | 'deny';
  }>;
}

export interface RolePrivilegeListScreenProps {
  roleId: number;
  roleCode?: string;
  roleName?: string;
  onAction?: (actionName: string, payload?: any) => void;
}

export const RolePrivilegeListScreen: React.FC<RolePrivilegeListScreenProps> = ({
  roleId,
  roleCode = '',
  roleName = '',
  onAction
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [groupedList, setGroupedList] = useState<GroupedPrivilege[]>([]);

  // Lookups
  const [accessObjectTypes, setAccessObjectTypes] = useState<Array<{ Id: number; Text: string; Code?: string }>>([]);
  const [accessActions, setAccessActions] = useState<
    Array<{ Id: number; Text: string; Code: string; ObjectTypeId?: number }>
  >([]);
  const [facilities, setFacilities] = useState<Array<{ Id: number; Text: string }>>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSaving, setModalSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [modalFacilityId, setModalFacilityId] = useState<number>(1);
  const [allowList, setAllowList] = useState<Array<{ Id: number; Code: string; Text: string }>>([]);
  const [denyList, setDenyList] = useState<Array<{ Id: number; Code: string; Text: string }>>([]);
  const [masterList, setMasterList] = useState<Array<{ Id: number; Code: string; Text: string }>>([]);

  // Load Lookups
  useEffect(() => {
    let isMounted = true;
    const fetchLookups = async () => {
      try {
        const res = await apiFetch<any>('General/Options/getoptions', [
          {
            Key: 'Facility',
            Request: { Params: [{ Key: 4, Value: true }] }
          },
          { Key: 'AccessAction' },
          { Key: 'AccessObjectType' }
        ]);

        if (isMounted && res) {
          if (res.AccessObjectType) setAccessObjectTypes(res.AccessObjectType);
          if (res.AccessAction) setAccessActions(res.AccessAction);
          if (res.Facility) {
            setFacilities(res.Facility);
            if (res.Facility.length > 0) setModalFacilityId(res.Facility[0].Id);
          }
        }
      } catch (err) {
        console.error('Failed to load privilege lookups:', err);
      }
    };

    fetchLookups();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Privileges
  const fetchPrivileges = useCallback(async () => {
    if (!roleId || roleId <= 0) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch<any>('SystemSettings/roleprivilege/GetRolePrivileges', {
        Params: [
          { Key: 1, Value: roleId },
          { Key: 3, Value: -1 },
          { Key: 4, Value: 1 } // FacilityId or current facility
        ],
        PageContext: { PageSize: 500, PageNumber: 1 }
      });

      const rawItems: RolePrivilegeItem[] = res?.Data || [];

      // Group by AccessObjectType
      const groupMap = new Map<number, GroupedPrivilege>();

      rawItems.forEach((item) => {
        if (!groupMap.has(item.AccessObjectTypeId)) {
          groupMap.set(item.AccessObjectTypeId, {
            AccessObjectTypeId: item.AccessObjectTypeId,
            PrivilegeType: item.AccessObjectType || 'General',
            FacilityName: item.Facility?.FacilityName,
            FacilityId: item.FacilityId,
            ActiveStatusId: item.ActiveStatusId,
            actions: []
          });
        }

        groupMap.get(item.AccessObjectTypeId)!.actions.push({
          Id: item.Id,
          PrivilegeActionId: item.PrivilegeActionId,
          AccessAction: item.AccessAction,
          Access: item.Access
        });
      });

      setGroupedList(Array.from(groupMap.values()));
    } catch (err: any) {
      console.error('Failed to fetch role privileges:', err);
      setErrorMsg(err.message || 'Failed to fetch privileges list.');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchPrivileges();
  }, [fetchPrivileges]);

  // Open Modal for Add
  const handleAddNew = () => {
    setSelectedTypeId(accessObjectTypes.length > 0 ? accessObjectTypes[0].Id : null);
    setAllowList([]);
    setDenyList([]);
    setModalError(null);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleEdit = (group: GroupedPrivilege) => {
    setSelectedTypeId(group.AccessObjectTypeId);
    if (group.FacilityId) setModalFacilityId(group.FacilityId);

    const allows: Array<{ Id: number; Code: string; Text: string }> = [];
    const denies: Array<{ Id: number; Code: string; Text: string }> = [];

    group.actions.forEach((act) => {
      const item = { Id: act.PrivilegeActionId, Code: act.AccessAction, Text: act.AccessAction };
      if (act.Access === 'allow') allows.push(item);
      else if (act.Access === 'deny') denies.push(item);
    });

    setAllowList(allows);
    setDenyList(denies);
    setModalError(null);
    setModalOpen(true);
  };

  // Compute masterList whenever selectedTypeId, allowList, or denyList changes
  useEffect(() => {
    if (!selectedTypeId) {
      setMasterList([]);
      return;
    }

    const assignedIds = new Set([...allowList.map((a) => a.Id), ...denyList.map((d) => d.Id)]);
    const relevantActions = accessActions.filter(
      (act) => act.ObjectTypeId === selectedTypeId || !act.ObjectTypeId
    );

    const available = relevantActions
      .filter((act) => !assignedIds.has(act.Id))
      .map((act) => ({
        Id: act.Id,
        Code: act.Code || act.Text,
        Text: act.Text
      }));

    setMasterList(available);
  }, [selectedTypeId, accessActions, allowList, denyList]);

  // Transfer Handlers
  const moveToAllow = (action: { Id: number; Code: string; Text: string }) => {
    setDenyList((prev) => prev.filter((d) => d.Id !== action.Id));
    setAllowList((prev) => [...prev, action]);
  };

  const moveToDeny = (action: { Id: number; Code: string; Text: string }) => {
    setAllowList((prev) => prev.filter((a) => a.Id !== action.Id));
    setDenyList((prev) => [...prev, action]);
  };

  const removeFromAssigned = (actionId: number) => {
    setAllowList((prev) => prev.filter((a) => a.Id !== actionId));
    setDenyList((prev) => prev.filter((d) => d.Id !== actionId));
  };

  const handleSavePrivileges = async () => {
    if (!selectedTypeId) {
      setModalError('Please select a Privilege Type / Object.');
      return;
    }

    setModalSaving(true);
    setModalError(null);

    try {
      const selectedTypeObj = accessObjectTypes.find((t) => t.Id === selectedTypeId);
      const typeCode = selectedTypeObj?.Code || selectedTypeObj?.Text || '';

      const actionsPayload: any[] = [];

      allowList.forEach((item) => {
        actionsPayload.push({
          RoleId: roleId,
          RoleCode: roleCode,
          FacilityId: modalFacilityId,
          AccessObjectTypeId: selectedTypeId,
          AccessObjectType: typeCode,
          PrivilegeActionId: item.Id,
          AccessAction: item.Code,
          Access: 'allow'
        });
      });

      denyList.forEach((item) => {
        actionsPayload.push({
          RoleId: roleId,
          RoleCode: roleCode,
          FacilityId: modalFacilityId,
          AccessObjectTypeId: selectedTypeId,
          AccessObjectType: typeCode,
          PrivilegeActionId: item.Id,
          AccessAction: item.Code,
          Access: 'deny'
        });
      });

      await apiFetch<any>('SystemSettings/roleprivilege/ManageRolePrivilege', {
        Id: roleId,
        Data: actionsPayload
      });

      setModalOpen(false);
      fetchPrivileges();
    } catch (err: any) {
      console.error('Failed to save role privileges:', err);
      setModalError(err.message || 'Failed to save privileges.');
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.background.primary,
        borderRadius: radii.md,
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.semibold,
              color: colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm
            }}
          >
            <i className="fa fa-key" style={{ color: colors.primary.main }} />
            Special Privileges & Permissions
          </h3>
          <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
            Define granular read, write, create, or delete permissions per business entity.
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          style={{
            padding: '7px 16px',
            backgroundColor: colors.primary.main,
            color: '#fff',
            border: 'none',
            borderRadius: radii.sm,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            boxShadow: '0 2px 6px rgba(74, 144, 226, 0.3)'
          }}
        >
          <i className="fa fa-plus" /> Add Privilege
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: spacing.md,
            backgroundColor: colors.state.dangerLight,
            color: colors.state.danger,
            borderRadius: radii.md,
            fontSize: typography.fontSizes.sm
          }}
        >
          <i className="fa fa-exclamation-triangle" style={{ marginRight: spacing.sm }} />
          {errorMsg}
        </div>
      )}

      {/* Privileges Table */}
      <div
        style={{
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: radii.md,
          overflow: 'hidden',
          backgroundColor: colors.background.primary
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                backgroundColor: colors.background.secondary,
                borderBottom: `2px solid ${colors.border.subtle}`,
                color: colors.text.secondary,
                fontSize: typography.fontSizes.xs,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <th style={{ padding: '12px 16px', width: '28%' }}>Privilege Entity / Type</th>
              <th style={{ padding: '12px 16px', width: '58%' }}>Configured Access Actions</th>
              <th style={{ padding: '12px 16px', width: '14%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ padding: spacing.xl, textAlign: 'center', color: colors.text.secondary }}>
                  <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, color: colors.primary.main }} />
                  <div>Loading privileges...</div>
                </td>
              </tr>
            ) : groupedList.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: spacing.xl, textAlign: 'center', color: colors.text.secondary }}>
                  <div style={{ fontSize: 32, opacity: 0.3, marginBottom: spacing.sm }}>
                    <i className="fa fa-shield-alt" />
                  </div>
                  <div>No special privileges configured for this role.</div>
                  <div style={{ fontSize: typography.fontSizes.xs, marginTop: 4 }}>
                    Click "+ Add Privilege" to set specific entity access permissions.
                  </div>
                </td>
              </tr>
            ) : (
              groupedList.map((group) => (
                <tr
                  key={group.AccessObjectTypeId}
                  style={{
                    borderBottom: `1px solid ${colors.border.subtle}`,
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.background.secondary)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: typography.fontWeights.semibold, color: colors.text.primary, fontSize: typography.fontSizes.sm }}>
                      {group.PrivilegeType}
                    </div>
                    {group.FacilityName && (
                      <div style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>
                        <i className="fa fa-hospital" style={{ marginRight: 4 }} />
                        {group.FacilityName}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                      {group.actions.map((act, i) => {
                        const isAllow = act.Access === 'allow';
                        return (
                          <span
                            key={i}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: radii.full,
                              fontSize: typography.fontSizes.xs,
                              fontWeight: typography.fontWeights.medium,
                              backgroundColor: isAllow ? 'rgba(40, 167, 69, 0.12)' : 'rgba(220, 53, 69, 0.12)',
                              color: isAllow ? '#1e7e34' : '#c82333'
                            }}
                          >
                            <i className={`fa fa-${isAllow ? 'check' : 'times'}`} style={{ fontSize: 10 }} />
                            {act.AccessAction}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      type="button"
                      title="Edit Permissions"
                      onClick={() => handleEdit(group)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: radii.sm,
                        border: `1px solid ${colors.border.subtle}`,
                        backgroundColor: colors.background.primary,
                        color: colors.primary.main,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fa fa-edit" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Privilege Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: colors.background.primary,
              borderRadius: radii.lg,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: 780,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.border.subtle}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.background.secondary
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: typography.fontSizes.md,
                    fontWeight: typography.fontWeights.semibold,
                    color: colors.text.primary
                  }}
                >
                  Configure Role Privileges
                </h3>
                <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
                  Select an object type and configure Allow or Deny actions
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, color: colors.text.secondary, cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: spacing.lg, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {modalError && (
                <div
                  style={{
                    padding: spacing.sm,
                    backgroundColor: colors.state.dangerLight,
                    color: colors.state.danger,
                    borderRadius: radii.sm,
                    fontSize: typography.fontSizes.xs
                  }}
                >
                  {modalError}
                </div>
              )}

              {/* Selector Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: typography.fontSizes.xs,
                      fontWeight: typography.fontWeights.medium,
                      color: colors.text.secondary,
                      marginBottom: spacing.xs
                    }}
                  >
                    Privilege Entity Type <span style={{ color: colors.state.danger }}>*</span>
                  </label>
                  <select
                    value={selectedTypeId || ''}
                    onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: radii.sm,
                      border: `1px solid ${colors.border.subtle}`,
                      backgroundColor: colors.background.primary,
                      color: colors.text.primary,
                      fontSize: typography.fontSizes.sm,
                      outline: 'none'
                    }}
                  >
                    {accessObjectTypes.map((t) => (
                      <option key={t.Id} value={t.Id}>
                        {t.Text}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: typography.fontSizes.xs,
                      fontWeight: typography.fontWeights.medium,
                      color: colors.text.secondary,
                      marginBottom: spacing.xs
                    }}
                  >
                    Facility / Hospital
                  </label>
                  <select
                    value={modalFacilityId ?? 1}
                    onChange={(e) => setModalFacilityId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: radii.sm,
                      border: `1px solid ${colors.border.subtle}`,
                      backgroundColor: colors.background.primary,
                      color: colors.text.primary,
                      fontSize: typography.fontSizes.sm,
                      outline: 'none'
                    }}
                  >
                    {facilities.map((f) => (
                      <option key={f.Id} value={f.Id}>
                        {f.Text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dual List / Action Buckets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.md, marginTop: spacing.xs }}>
                {/* Available Actions */}
                <div
                  style={{
                    border: `1px solid ${colors.border.subtle}`,
                    borderRadius: radii.md,
                    padding: spacing.sm,
                    backgroundColor: colors.background.secondary,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      fontSize: typography.fontSizes.xs,
                      fontWeight: typography.fontWeights.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Available Actions</span>
                    <span>({masterList.length})</span>
                  </div>
                  <div style={{ flex: 1, minHeight: 180, maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {masterList.length === 0 ? (
                      <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, textAlign: 'center', marginTop: 30 }}>
                        No remaining actions
                      </div>
                    ) : (
                      masterList.map((item) => (
                        <div
                          key={item.Id}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: colors.background.primary,
                            borderRadius: radii.sm,
                            border: `1px solid ${colors.border.subtle}`,
                            fontSize: typography.fontSizes.xs,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{item.Text}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              title="Allow"
                              onClick={() => moveToAllow(item)}
                              style={{
                                padding: '2px 6px',
                                fontSize: 10,
                                borderRadius: radii.xs,
                                border: 'none',
                                backgroundColor: colors.state.successLight,
                                color: colors.state.success,
                                cursor: 'pointer'
                              }}
                            >
                              Allow
                            </button>
                            <button
                              type="button"
                              title="Deny"
                              onClick={() => moveToDeny(item)}
                              style={{
                                padding: '2px 6px',
                                fontSize: 10,
                                borderRadius: radii.xs,
                                border: 'none',
                                backgroundColor: colors.state.dangerLight,
                                color: colors.state.danger,
                                cursor: 'pointer'
                              }}
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Allowed Actions */}
                <div
                  style={{
                    border: '1px solid rgba(40, 167, 69, 0.3)',
                    borderRadius: radii.md,
                    padding: spacing.sm,
                    backgroundColor: 'rgba(40, 167, 69, 0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      fontSize: typography.fontSizes.xs,
                      fontWeight: typography.fontWeights.semibold,
                      color: '#1e7e34',
                      marginBottom: spacing.xs,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Allowed Access</span>
                    <span>({allowList.length})</span>
                  </div>
                  <div style={{ flex: 1, minHeight: 180, maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {allowList.length === 0 ? (
                      <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, textAlign: 'center', marginTop: 30 }}>
                        None allowed
                      </div>
                    ) : (
                      allowList.map((item) => (
                        <div
                          key={item.Id}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: colors.background.primary,
                            borderRadius: radii.sm,
                            border: '1px solid rgba(40, 167, 69, 0.3)',
                            fontSize: typography.fontSizes.xs,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ color: '#1e7e34', fontWeight: typography.fontWeights.medium }}>{item.Text}</span>
                          <button
                            type="button"
                            title="Remove"
                            onClick={() => removeFromAssigned(item.Id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: colors.text.secondary,
                              cursor: 'pointer',
                              fontSize: 14
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Denied Actions */}
                <div
                  style={{
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    borderRadius: radii.md,
                    padding: spacing.sm,
                    backgroundColor: 'rgba(220, 53, 69, 0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      fontSize: typography.fontSizes.xs,
                      fontWeight: typography.fontWeights.semibold,
                      color: '#c82333',
                      marginBottom: spacing.xs,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Denied Access</span>
                    <span>({denyList.length})</span>
                  </div>
                  <div style={{ flex: 1, minHeight: 180, maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {denyList.length === 0 ? (
                      <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, textAlign: 'center', marginTop: 30 }}>
                        None denied
                      </div>
                    ) : (
                      denyList.map((item) => (
                        <div
                          key={item.Id}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: colors.background.primary,
                            borderRadius: radii.sm,
                            border: '1px solid rgba(220, 53, 69, 0.3)',
                            fontSize: typography.fontSizes.xs,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ color: '#c82333', fontWeight: typography.fontWeights.medium }}>{item.Text}</span>
                          <button
                            type="button"
                            title="Remove"
                            onClick={() => removeFromAssigned(item.Id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: colors.text.secondary,
                              cursor: 'pointer',
                              fontSize: 14
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                borderTop: `1px solid ${colors.border.subtle}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: spacing.sm,
                backgroundColor: colors.background.secondary
              }}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={modalSaving}
                style={{
                  padding: '7px 16px',
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.border.subtle}`,
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                  fontSize: typography.fontSizes.sm,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePrivileges}
                disabled={modalSaving}
                style={{
                  padding: '7px 20px',
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: colors.primary.main,
                  color: '#fff',
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.medium,
                  cursor: modalSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}
              >
                {modalSaving ? (
                  <>
                    <i className="fa fa-spinner fa-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <i className="fa fa-save" /> Save Privileges
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
