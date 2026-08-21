import React, { useState, useEffect, useRef } from 'react';
import { colors, spacing, radii, shadows, typography, controlHeight } from '../components/ui/tokens';
import { Loading } from '../components/ui/Loading';

export interface PatientSearchControlProps {
  reactProps: {
    controlId: string;
    canDisable: boolean;
    tabIndex: number;
    patientDisplay: string;
    placeholder: string;
  };
  onSearch: (query: string) => Promise<any[]>;
  onSelect: (patient: any) => void;
}

export const PatientSearchControl: React.FC<PatientSearchControlProps> = ({
  reactProps = {
    controlId: '',
    canDisable: false,
    tabIndex: 0,
    patientDisplay: '',
    placeholder: 'Search Name/Phone/UHID....'
  },
  onSearch,
  onSelect
}) => {
  const [prevDisplay, setPrevDisplay] = useState(reactProps.patientDisplay);
  const [inputValue, setInputValue] = useState(reactProps.patientDisplay || '');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync input value if external patientDisplay changes
  if (reactProps.patientDisplay !== prevDisplay) {
    setPrevDisplay(reactProps.patientDisplay);
    setInputValue(reactProps.patientDisplay || '');
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    setActiveIndex(-1);

    if (query && query.length >= 2) {
      setIsLoading(true);
      setIsOpen(true);
      try {
        const data = await onSearch(query);
        setResults(data || []);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (patient: any) => {
    onSelect(patient);
    setIsOpen(false);
    setResults([]);
    // The parent will update patientDisplay via props if needed, but we can optimistically set it or wait
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="typeahead-demo" style={{ position: 'relative' }} ref={wrapperRef}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div className="col-sm-12" style={{ padding: 0, position: 'relative' }}>
          {/*
            NOTE ON DESIGN-SYSTEM USAGE: the design system's <SearchBox> only
            accepts {value, onChange, onSubmit, placeholder, onClear, autoFocus} --
            it has no passthrough for `id`, `disabled`, `tabIndex`, `onKeyDown`, or
            `onFocus`. This control genuinely needs all of those (id is a real
            legacy hook -- see `.typeahead-demo>input` in registrationcumvisit.html
            and `.drhms-filters .search .typeahead-demo` in regcumvisitwithbill.html
            -- disabled/tabIndex come straight from reactProps, onKeyDown drives the
            real Up/Down/Enter/Escape result navigation, and onFocus reopens the
            dropdown). Swapping in <SearchBox> as-is would silently drop that
            wiring, so per the "don't distort real behavior to fit a component
            that doesn't match" rule this keeps the real <input> and simply
            reskins it to match SearchBox's exact visual language (icon inset,
            tokens-based border/radius/height/type) instead.
          */}
          <i
            className={isLoading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-magnifying-glass'}
            style={{
              position: 'absolute',
              left: spacing.sm,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '13px',
              color: colors.textSubtle,
              pointerEvents: 'none',
            }}
          />
          <input
            id={reactProps.controlId || 'pid'}
            type="text"
            className="premium-input pid"
            placeholder={reactProps.placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={reactProps.canDisable}
            tabIndex={reactProps.tabIndex}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            autoComplete="off"
            style={{
              width: '100%',
              height: controlHeight,
              padding: `0 ${spacing.sm} 0 30px`,
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              backgroundColor: reactProps.canDisable ? colors.surfaceMuted : colors.surface,
              color: reactProps.canDisable ? colors.textSubtle : colors.textMain,
              fontFamily: typography.fontFamily,
              fontSize: typography.body.fontSize,
              boxSizing: 'border-box',
              cursor: reactProps.canDisable ? 'not-allowed' : 'text',
            }}
          />
        </div>
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div
          style={{
            display: 'block',
            position: 'absolute',
            top: '100%',
            left: 0,
            // Kept at the original literal 9999 (rather than the tokens.zIndex.dropdown
            // value of 1000) deliberately: this overlay must stay above any host-page
            // chrome it renders inside across the whole app, exactly as before --
            // adopting the lower shared token here is a real stacking-behavior change,
            // not a visual-only one, so it's out of scope for this pass.
            zIndex: 9999,
            maxHeight: '250px',
            overflow: 'auto',
            maxWidth: '600px',
            marginTop: '2px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            boxShadow: shadows.lg,
          }}
        >
          {isLoading && results.length === 0 ? (
            <Loading text="Loading..." size="sm" />
          ) : (
            <table className="table table-bordered table-condensed" style={{ margin: 0, background: 'transparent', borderCollapse: 'collapse' }} role="listbox">
              <thead>
                <tr style={{ backgroundColor: colors.primary }}>
                  <th style={{ width: '120px', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: `${spacing.xs} ${spacing.sm}` }}>Title</th>
                  <th style={{ minWidth: '100px', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: `${spacing.xs} ${spacing.sm}` }}>Name</th>
                  <th style={{ width: '110px', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: `${spacing.xs} ${spacing.sm}` }}>DOB</th>
                  <th style={{ width: '70px', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: `${spacing.xs} ${spacing.sm}` }}>Age/Gender</th>
                  <th style={{ width: '100px', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: `${spacing.xs} ${spacing.sm}` }}>MRN</th>
                  <th style={{ width: '100px', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: `${spacing.xs} ${spacing.sm}` }}>Mobile #</th>
                </tr>
              </thead>
              <tbody>
                {results.map((patient, index) => {
                  // Format DOB
                  let dobDisplay = '';
                  if (patient.DOB) {
                    const d = new Date(patient.DOB);
                    if (!isNaN(d.getTime())) {
                      const day = d.getDate().toString().padStart(2, '0');
                      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                      const month = months[d.getMonth()];
                      const year = d.getFullYear();
                      dobDisplay = `${day}-${month}-${year}`;
                    }
                  }

                  return (
                    <tr
                      key={patient.Id || index}
                      className={`uib-typeahead-match ${index === activeIndex ? 'active' : ''}`}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: index === activeIndex ? colors.primaryLight : 'transparent',
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(patient)}
                      role="option"
                    >
                      <td className="td-title" style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{patient.TitleDesc}</td>
                      <td className="td-name" style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{patient.PatientName}</td>
                      <td className="td-dob" style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border, whiteSpace: 'nowrap' }}>{dobDisplay}</td>
                      <td className="td-age" style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{patient.Age}/{patient.GenderCode}</td>
                      <td className="td-mrn" style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{patient.MRN}</td>
                      <td className="td-mrn" style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{patient.Mobile}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
