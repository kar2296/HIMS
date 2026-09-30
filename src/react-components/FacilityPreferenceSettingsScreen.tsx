import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface PreferenceItem {
  Id?: number;
  FacilityId?: number;
  Category?: string;
  Section?: string;
  PreferenceKey: string;
  PreferenceDisplay?: string;
  PreferenceType?: string; // 'checkbox' | 'select' | 'text' | 'number' | 'password'
  PreferenceValue?: any;
  Row?: number;
  Col?: number;
  [key: string]: any;
}

export interface FacilityPreferenceSettingsScreenProps {
  category: string;
  facilityId: number;
  title?: string;
  subtitle?: string;
}

export const FacilityPreferenceSettingsScreen: React.FC<FacilityPreferenceSettingsScreenProps> = ({
  category,
  facilityId,
  title,
  subtitle
}) => {
  const [preferences, setPreferences] = useState<PreferenceItem[]>([]);
  const [modelData, setModelData] = useState<Record<string, any>>({});
  const [lookups, setLookups] = useState<Record<string, any[]>>({});
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const preferenceLookupMap: Record<string, string> = {
    defaultcurrency: 'CurrencyCode',
    dateformat: 'DateFormat',
    timeformat: 'TimeFormat',
    profile: 'Profile'
  };

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      setLoading(true);
      setMsg(null);
      try {
        // Load lookups
        const lookupRes = await apiFetch('General/Options/getoptions', [
          { Key: 'CurrencyCode' },
          { Key: 'DateFormat' },
          { Key: 'TimeFormat' },
          { Key: 'Profile' }
        ]);

        if (isMounted && lookupRes) {
          setLookups(lookupRes);
        }

        // Load Preferences
        if (facilityId > 0) {
          const res = await apiFetch('SystemSettings/FacilityPreference/GetFacilityPreferences', {
            Params: [
              { Key: 1, Value: category },
              { Key: 3, Value: facilityId }
            ],
            PageContext: { PageSize: 500, PageNumber: 1 }
          });

          if (isMounted && res && res.Data) {
            setPreferences(res.Data);
            const initialMap: Record<string, any> = {};
            for (const item of res.Data) {
              if (item.PreferenceType === 'checkbox') {
                initialMap[item.PreferenceKey] = item.PreferenceValue === '1' || item.PreferenceValue === 1 || item.PreferenceValue === true;
              } else {
                initialMap[item.PreferenceKey] = item.PreferenceValue ?? '';
              }
            }
            setModelData(initialMap);
          }
        }
      } catch (err) {
        console.error(`Failed to load ${category} preferences`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPreferences();
    return () => { isMounted = false; };
  }, [category, facilityId]);

  const handleChange = (key: string, value: any) => {
    setModelData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = preferences.map(item => {
        let val = modelData[item.PreferenceKey];
        if (item.PreferenceType === 'checkbox') {
          val = val ? '1' : '0';
        }
        return {
          ...item,
          FacilityId: facilityId,
          PreferenceValue: val
        };
      });

      await apiFetch('SystemSettings/Facilitypreference/ManageFacilityPreferences', { Data: payload });
      setMsg({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  // Filter preferences by search keyword
  const filteredPrefs = preferences.filter(p => {
    if (!filterText.trim()) return true;
    const term = filterText.toLowerCase();
    return (
      (p.PreferenceDisplay && p.PreferenceDisplay.toLowerCase().includes(term)) ||
      (p.PreferenceKey && p.PreferenceKey.toLowerCase().includes(term)) ||
      (p.Section && p.Section.toLowerCase().includes(term))
    );
  });

  // Group by Section
  const groupedSections: Record<string, PreferenceItem[]> = {};
  for (const p of filteredPrefs) {
    const sec = p.Section || 'General Options';
    if (!groupedSections[sec]) groupedSections[sec] = [];
    groupedSections[sec].push(p);
  }

  const renderControl = (item: PreferenceItem) => {
    const val = modelData[item.PreferenceKey];

    if (item.PreferenceType === 'checkbox') {
      return (
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            fontSize: 13,
            color: colors.textBody,
            userSelect: 'none'
          }}
        >
          <input
            type="checkbox"
            checked={!!val}
            onChange={(e) => handleChange(item.PreferenceKey, e.target.checked)}
            style={{ width: 16, height: 16, accentColor: colors.primary }}
          />
          <span style={{ fontWeight: 500 }}>{item.PreferenceDisplay || item.PreferenceKey}</span>
        </label>
      );
    }

    if (item.PreferenceType === 'select') {
      const lookupKey = preferenceLookupMap[item.PreferenceKey] || item.PreferenceKey;
      const options = lookups[lookupKey] || [];

      return (
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textBody, marginBottom: 4 }}>
            {item.PreferenceDisplay || item.PreferenceKey}
          </label>
          <select
            value={val || ''}
            onChange={(e) => handleChange(item.PreferenceKey, e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: 12,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              background: '#fff',
              outline: 'none'
            }}
          >
            <option value="">Select Option</option>
            {options.map((opt: any) => (
              <option key={opt.Id || opt.Key} value={opt.Id || opt.Key}>
                {opt.Text || opt.Value}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textBody, marginBottom: 4 }}>
          {item.PreferenceDisplay || item.PreferenceKey}
        </label>
        <input
          type={item.PreferenceType === 'number' ? 'number' : item.PreferenceType === 'password' ? 'password' : 'text'}
          value={val ?? ''}
          onChange={(e) => handleChange(item.PreferenceKey, e.target.value)}
          placeholder={`Enter ${item.PreferenceDisplay || item.PreferenceKey}`}
          style={{
            width: '100%',
            padding: '7px 10px',
            fontSize: 12,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textMuted }}>
        <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary }} />
        <div style={{ marginTop: spacing.sm, fontSize: 13 }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      {/* Header and Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
          marginBottom: spacing.md
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.textMain }}>
            {title || `${category.toUpperCase()} Settings`}
          </h4>
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            {subtitle || 'Manage facility-level behavioral preferences and operational flags.'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search setting..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{
                padding: '6px 12px 6px 30px',
                fontSize: 12,
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
            disabled={saving}
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: colors.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: radii.md,
              padding: '7px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: '0 1px 3px rgba(37,99,235,0.2)'
            }}
          >
            {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-save" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {msg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: radii.md,
            marginBottom: spacing.md,
            fontSize: 13,
            fontWeight: 500,
            background: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: msg.type === 'success' ? '#166534' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <i className={`fa ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Sections Cards */}
      {Object.keys(groupedSections).length === 0 ? (
        <div
          style={{
            padding: spacing.xl,
            textAlign: 'center',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            color: colors.textMuted
          }}
        >
          No settings found matching your search.
        </div>
      ) : (
        Object.entries(groupedSections).map(([sectionTitle, items]) => (
          <div
            key={sectionTitle}
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              padding: spacing.md,
              marginBottom: spacing.md,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.textMain,
                marginBottom: spacing.sm,
                paddingBottom: 6,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <i className="fa fa-sliders" style={{ color: colors.primary, fontSize: 11 }} />
              <span>{sectionTitle}</span>
              <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 400 }}>
                ({items.length} {items.length === 1 ? 'option' : 'options'})
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px 16px',
                padding: '4px 0'
              }}
            >
              {items.map((item) => (
                <div key={item.PreferenceKey}>
                  {renderControl(item)}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Footer Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: spacing.md }}>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: colors.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: radii.md,
            padding: '8px 24px',
            fontSize: 13,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)'
          }}
        >
          {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-save" />}
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};
