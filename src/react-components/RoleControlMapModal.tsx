import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface RoleControlMapModalProps {
  isOpen: boolean;
  roleId: number;
  roleName: string;
  onClose: () => void;
  onSaved?: () => void;
}

export interface ControlItem {
  Id: number;
  ControlCode: string;
  Display: string;
  TranslateRef?: string;
  IconRef?: string;
  ParentControlCode?: string;
  ControlPosition?: number;
  ControlType?: string;
}

interface TreeNode extends ControlItem {
  children: TreeNode[];
  label: string;
}

export const RoleControlMapModal: React.FC<RoleControlMapModalProps> = ({
  isOpen,
  roleId,
  roleName,
  onClose,
  onSaved
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [treeFilter, setTreeFilter] = useState<string>('');
  const [rawControls, setRawControls] = useState<ControlItem[]>([]);
  const [selectedControlCodes, setSelectedControlCodes] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load controls and existing role controls
  useEffect(() => {
    if (!isOpen || !roleId) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    const loadData = async () => {
      try {
        // 1. Fetch all controls
        const controlsRes = await apiFetch<any>('SystemSettings/control/GetControls', {
          Params: [],
          PageContext: { PageSize: 1000, PageNumber: 1 }
        });

        const controls: ControlItem[] = controlsRes?.Data || [];

        // 2. Fetch role mapped controls
        const mappedRes = await apiFetch<any>('SystemSettings/Role/GetControls', {
          Params: [{ Key: 0, Value: roleId }],
          PageContext: { PageSize: 1000, PageNumber: 1 }
        });

        const mappedList: any[] = mappedRes?.Data || [];
        const mappedCodes = new Set<string>();
        mappedList.forEach((m) => {
          if (m.ControlCode) mappedCodes.add(m.ControlCode);
        });

        if (isMounted) {
          setRawControls(controls);
          setSelectedControlCodes(mappedCodes);
          // Expand first level by default
          const topLevelCodes = new Set<string>();
          controls.forEach((c) => {
            if (!c.ParentControlCode) topLevelCodes.add(c.ControlCode);
          });
          setExpandedNodes(topLevelCodes);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load role controls:', err);
          setErrorMsg(err.message || 'Failed to load menu controls.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, roleId]);

  // Build hierarchical tree
  const treeRoots = useMemo(() => {
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Create node objects
    rawControls.forEach((item) => {
      const label = item.Display || item.ControlCode;
      nodeMap.set(item.ControlCode, {
        ...item,
        children: [],
        label
      });
    });

    // Link parents & children
    rawControls.forEach((item) => {
      const node = nodeMap.get(item.ControlCode);
      if (!node) return;

      if (item.ParentControlCode && nodeMap.has(item.ParentControlCode)) {
        nodeMap.get(item.ParentControlCode)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [rawControls]);

  // Filter helper
  const filterMatches = (node: TreeNode, term: string): boolean => {
    if (!term) return true;
    const lower = term.toLowerCase();
    if (node.label.toLowerCase().includes(lower) || node.ControlCode.toLowerCase().includes(lower)) {
      return true;
    }
    return node.children.some((child) => filterMatches(child, term));
  };

  const toggleExpand = (controlCode: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(controlCode)) {
        next.delete(controlCode);
      } else {
        next.add(controlCode);
      }
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    rawControls.forEach((c) => all.add(c.ControlCode));
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Check / Uncheck logic including descendants
  const toggleNodeSelect = (node: TreeNode) => {
    setSelectedControlCodes((prev) => {
      const next = new Set(prev);
      const isSelected = next.has(node.ControlCode);

      // Recursive selector
      const applySelection = (curr: TreeNode, select: boolean) => {
        if (select) {
          next.add(curr.ControlCode);
        } else {
          next.delete(curr.ControlCode);
        }
        curr.children.forEach((ch) => applySelection(ch, select));
      };

      applySelection(node, !isSelected);

      // If selecting a child, also ensure ancestors are selected so path is accessible
      if (!isSelected && node.ParentControlCode) {
        let parentCode: string | undefined = node.ParentControlCode;
        while (parentCode) {
          next.add(parentCode);
          const p = rawControls.find((c) => c.ControlCode === parentCode);
          parentCode = p?.ParentControlCode;
        }
      }

      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<string>();
    rawControls.forEach((c) => all.add(c.ControlCode));
    setSelectedControlCodes(all);
  };

  const deselectAll = () => {
    setSelectedControlCodes(new Set());
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      // Build selectedNodes payload exactly as backend expects:
      // [{ RoleId, ControlCode, ControlId, DisplayOrder }, ...]
      const selectedNodes: any[] = [];
      let order = 0;

      rawControls.forEach((c) => {
        if (selectedControlCodes.has(c.ControlCode)) {
          selectedNodes.push({
            RoleId: roleId,
            ControlCode: c.ControlCode,
            ControlId: c.Id,
            DisplayOrder: order++
          });
        }
      });

      await apiFetch<any>('SystemSettings/Role/MapControls', {
        Id: roleId,
        Data: selectedNodes
      });

      setSaveSuccessMsg('Menu controls mapped successfully!');
      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 900);
    } catch (err: any) {
      console.error('Failed to map controls:', err);
      setErrorMsg(err.message || 'Failed to save role control mappings.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    if (!filterMatches(node, treeFilter)) return null;

    const isExpanded = expandedNodes.has(node.ControlCode);
    const isSelected = selectedControlCodes.has(node.ControlCode);
    const hasChildren = node.children.length > 0;

    // Check if some children are selected
    const allChildrenSelected = hasChildren && node.children.every((ch) => selectedControlCodes.has(ch.ControlCode));
    const someChildrenSelected = hasChildren && !allChildrenSelected && node.children.some((ch) => selectedControlCodes.has(ch.ControlCode));

    return (
      <div key={node.ControlCode} style={{ marginLeft: depth * 22 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            padding: '5px 8px',
            borderRadius: radii.sm,
            backgroundColor: isSelected ? 'rgba(74, 144, 226, 0.08)' : 'transparent',
            transition: 'background-color 0.15s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = colors.background.tertiary;
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Expand / Collapse toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.ControlCode);
              }}
              style={{
                width: 22,
                height: 22,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                color: colors.text.secondary,
                cursor: 'pointer',
                borderRadius: radii.sm
              }}
            >
              <i className={`fa fa-chevron-${isExpanded ? 'down' : 'right'}`} style={{ fontSize: 11 }} />
            </button>
          ) : (
            <span style={{ width: 22 }} />
          )}

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = someChildrenSelected;
              }
            }}
            onChange={() => toggleNodeSelect(node)}
            style={{
              width: 16,
              height: 16,
              cursor: 'pointer',
              accentColor: colors.primary.main
            }}
          />

          {/* Node Icon */}
          <span style={{ color: colors.primary.main, fontSize: 13, width: 16, textAlign: 'center' }}>
            <i className={`fa ${node.IconRef || (hasChildren ? 'fa-folder' : 'fa-file-alt')}`} />
          </span>

          {/* Node Label */}
          <span
            onClick={() => toggleNodeSelect(node)}
            style={{
              fontSize: typography.fontSizes.sm,
              fontWeight: hasChildren ? typography.fontWeights.medium : typography.fontWeights.normal,
              color: colors.text.primary,
              userSelect: 'none',
              flex: 1
            }}
          >
            {node.label}
            {node.ControlType && (
              <span
                style={{
                  marginLeft: spacing.sm,
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: radii.full,
                  backgroundColor: colors.background.tertiary,
                  color: colors.text.secondary,
                  fontWeight: typography.fontWeights.normal
                }}
              >
                {node.ControlType}
              </span>
            )}
          </span>
        </div>

        {/* Children render */}
        {hasChildren && isExpanded && (
          <div style={{ borderLeft: `1px dashed ${colors.border.subtle}`, marginLeft: 10, paddingLeft: 4 }}>
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.background.primary,
          borderRadius: radii.lg,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: 850,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.semibold,
                color: colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm
              }}
            >
              <i className="fa fa-cogs" style={{ color: colors.primary.main }} />
              Role Controls Mapping
            </h3>
            <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary, marginTop: 2 }}>
              Configure accessible screens, tabs, and menus for role: <strong>{roleName}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              lineHeight: 1,
              color: colors.text.secondary,
              cursor: 'pointer',
              padding: 4
            }}
          >
            &times;
          </button>
        </div>

        {/* Toolbar: Search, Select All, Expand All */}
        <div
          style={{
            padding: `${spacing.sm} ${spacing.lg}`,
            borderBottom: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
            backgroundColor: colors.background.primary
          }}
        >
          <div style={{ position: 'relative', width: 280 }}>
            <i
              className="fa fa-search"
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.text.secondary,
                fontSize: 12
              }}
            />
            <input
              type="text"
              placeholder="Search menus and controls..."
              value={treeFilter}
              onChange={(e) => setTreeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                fontSize: typography.fontSizes.sm,
                borderRadius: radii.full,
                border: `1px solid ${colors.border.subtle}`,
                outline: 'none',
                backgroundColor: colors.background.tertiary
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <button
              type="button"
              onClick={selectAll}
              style={{
                fontSize: typography.fontSizes.xs,
                padding: '5px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.secondary,
                cursor: 'pointer',
                color: colors.text.primary
              }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              style={{
                fontSize: typography.fontSizes.xs,
                padding: '5px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.secondary,
                cursor: 'pointer',
                color: colors.text.primary
              }}
            >
              Deselect All
            </button>
            <span style={{ width: 1, height: 16, backgroundColor: colors.border.subtle, margin: '0 4px' }} />
            <button
              type="button"
              onClick={expandAll}
              style={{
                fontSize: typography.fontSizes.xs,
                padding: '5px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.secondary,
                cursor: 'pointer',
                color: colors.text.primary
              }}
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              style={{
                fontSize: typography.fontSizes.xs,
                padding: '5px 10px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.secondary,
                cursor: 'pointer',
                color: colors.text.primary
              }}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Tree Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${spacing.md} ${spacing.lg}`,
            minHeight: 340
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.secondary }}>
              <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, color: colors.primary.main }} />
              <div>Loading controls hierarchy...</div>
            </div>
          ) : errorMsg ? (
            <div
              style={{
                padding: spacing.md,
                backgroundColor: colors.state.dangerLight,
                color: colors.state.danger,
                borderRadius: radii.md,
                fontSize: typography.fontSizes.sm
              }}
            >
              <i className="fa fa-exclamation-circle" style={{ marginRight: spacing.sm }} />
              {errorMsg}
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: spacing.sm,
                  fontSize: typography.fontSizes.xs,
                  color: colors.text.secondary
                }}
              >
                <span>Menu Hierarchy</span>
                <span>
                  <strong>{selectedControlCodes.size}</strong> of {rawControls.length} items selected
                </span>
              </div>

              <div
                style={{
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: radii.md,
                  padding: spacing.sm,
                  backgroundColor: colors.background.primary
                }}
              >
                {treeRoots.map((root) => renderTreeNode(root, 0))}
              </div>
            </div>
          )}

          {saveSuccessMsg && (
            <div
              style={{
                marginTop: spacing.md,
                padding: spacing.sm,
                backgroundColor: colors.state.successLight,
                color: colors.state.success,
                borderRadius: radii.md,
                fontSize: typography.fontSizes.sm,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm
              }}
            >
              <i className="fa fa-check-circle" />
              {saveSuccessMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: `${spacing.sm} ${spacing.lg}`,
            borderTop: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.background.secondary
          }}
        >
          <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
            {selectedControlCodes.size} controls will be assigned to role
          </div>

          <div style={{ display: 'flex', gap: spacing.sm }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
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
              onClick={handleSave}
              disabled={saving || loading}
              style={{
                padding: '7px 20px',
                borderRadius: radii.sm,
                border: 'none',
                backgroundColor: colors.primary.main,
                color: '#fff',
                fontSize: typography.fontSizes.sm,
                fontWeight: typography.fontWeights.medium,
                cursor: saving || loading ? 'not-allowed' : 'pointer',
                opacity: saving || loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm
              }}
            >
              {saving ? (
                <>
                  <i className="fa fa-spinner fa-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa fa-save" />
                  Save Controls
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
