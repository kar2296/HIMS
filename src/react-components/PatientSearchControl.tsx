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

  const [alignRight, setAlignRight] = useState(false);

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth / 2) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
  }, [isOpen]);

  return (
    <div className="typeahead-demo" style={{ position: 'relative', width: '100%', display: 'block' }} ref={wrapperRef}>
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <i
          className={isLoading ? 'fa-solid fa-circle-notch fa-spin fas fa-spinner' : 'fa-solid fa-magnifying-glass fas fa-search'}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: colors.textSubtle,
            pointerEvents: 'none',
            zIndex: 2,
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
            height: '31px',
            lineHeight: '19px',
            padding: '4px 10px 4px 30px',
            borderRadius: '5px',
            border: `1px solid ${colors.border}`,
            backgroundColor: reactProps.canDisable ? colors.surfaceMuted : colors.surface,
            color: reactProps.canDisable ? colors.textSubtle : colors.textMain,
            fontFamily: typography.fontFamily,
            fontSize: '12px',
            boxSizing: 'border-box',
            cursor: reactProps.canDisable ? 'not-allowed' : 'text',
          }}
        />
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div
          style={{
            display: 'block',
            position: 'absolute',
            top: '100%',
            left: alignRight ? 'auto' : 0,
            right: alignRight ? 0 : 'auto',
            zIndex: 99999,
            maxHeight: '280px',
            overflow: 'auto',
            minWidth: '600px',
            maxWidth: 'min(750px, calc(100vw - 32px))',
            marginTop: '4px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.12)',
          }}
        >
          {isLoading && results.length === 0 ? (
            <Loading text="Loading..." size="sm" />
          ) : (
            <table className="table table-bordered table-condensed" style={{ margin: 0, width: '100%', background: 'transparent', borderCollapse: 'collapse' }} role="listbox">
              <thead>
                <tr style={{ backgroundColor: '#1e40af' }}>
                  <th style={{ width: '55px', whiteSpace: 'nowrap', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: '6px 10px' }}>Title</th>
                  <th style={{ minWidth: '180px', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: '6px 10px' }}>Name</th>
                  <th style={{ width: '100px', whiteSpace: 'nowrap', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: '6px 10px' }}>DOB</th>
                  <th style={{ width: '85px', whiteSpace: 'nowrap', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: '6px 10px' }}>Age/Gender</th>
                  <th style={{ width: '110px', whiteSpace: 'nowrap', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: '6px 10px' }}>MRN</th>
                  <th style={{ width: '110px', whiteSpace: 'nowrap', color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: '6px 10px' }}>Mobile #</th>
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
                      <td className="td-title" style={{ ...typography.body, fontSize: '12px', whiteSpace: 'nowrap', color: colors.textMain, padding: '6px 10px', borderColor: colors.border }}>{patient.TitleDesc}</td>
                      <td className="td-name" style={{ ...typography.body, fontSize: '12px', fontWeight: 600, color: colors.textMain, padding: '6px 10px', borderColor: colors.border }}>{patient.PatientName}</td>
                      <td className="td-dob" style={{ ...typography.body, fontSize: '12px', whiteSpace: 'nowrap', color: colors.textMain, padding: '6px 10px', borderColor: colors.border }}>{dobDisplay}</td>
                      <td className="td-age" style={{ ...typography.body, fontSize: '12px', whiteSpace: 'nowrap', color: colors.textMain, padding: '6px 10px', borderColor: colors.border }}>{patient.Age}/{patient.GenderCode}</td>
                      <td className="td-mrn" style={{ ...typography.body, fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 600, color: '#1d4ed8', padding: '6px 10px', borderColor: colors.border }}>{patient.MRN}</td>
                      <td className="td-mobile" style={{ ...typography.body, fontSize: '12px', whiteSpace: 'nowrap', color: colors.textMain, padding: '6px 10px', borderColor: colors.border }}>{patient.Mobile}</td>
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
