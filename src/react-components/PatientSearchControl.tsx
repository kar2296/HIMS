import React, { useState, useEffect, useRef } from 'react';

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
  const [inputValue, setInputValue] = useState(reactProps.patientDisplay || '');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync input value if external patientDisplay changes (e.g. initial load)
  useEffect(() => {
    if (reactProps.patientDisplay !== undefined) {
      setInputValue(reactProps.patientDisplay);
    }
  }, [reactProps.patientDisplay]);

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
        <div className="col-sm-12" style={{ padding: 0 }}>
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
          />
        </div>
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div 
          className="premium-glass-panel" 
          style={{
            display: 'block',
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 9999,
            maxHeight: '250px',
            overflow: 'auto',
            maxWidth: '600px',
            marginTop: '2px'
          }}
        >
          {isLoading && results.length === 0 ? (
            <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : (
            <table className="table table-bordered table-condensed" style={{ margin: 0, background: 'transparent' }} role="listbox">
              <thead style={{ backgroundColor: 'var(--premium-blue)', color: '#ffffff' }}>
                <tr>
                  <th style={{ width: '120px', color: '#ffffff' }}>Title</th>
                  <th style={{ minWidth: '100px', color: '#ffffff' }}>Name</th>
                  <th style={{ width: '110px', color: '#ffffff' }}>DOB</th>
                  <th style={{ width: '70px', color: '#ffffff' }}>Age/Gender</th>
                  <th style={{ width: '100px', color: '#ffffff' }}>MRN</th>
                  <th style={{ width: '100px', color: '#ffffff' }}>Mobile #</th>
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
                      style={{ cursor: 'pointer', backgroundColor: index === activeIndex ? '#f5f5f5' : 'transparent' }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(patient)}
                      role="option"
                    >
                      <td className="td-title">{patient.TitleDesc}</td>
                      <td className="td-name">{patient.PatientName}</td>
                      <td className="td-dob" style={{ whiteSpace: 'nowrap' }}>{dobDisplay}</td>
                      <td className="td-age">{patient.Age}/{patient.GenderCode}</td>
                      <td className="td-mrn">{patient.MRN}</td>
                      <td className="td-mrn">{patient.Mobile}</td>
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
