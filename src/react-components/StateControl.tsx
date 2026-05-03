import React, { useState, useEffect } from 'react';

interface StateItem {
  Id: number;
  StateName: string;
}

interface StateControlProps {
  stateid?: number | null;
  countryid?: number | null;
  candisable?: boolean;
  apiFetch?: (action: string, payload: any) => Promise<any>;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const StateControl: React.FC<StateControlProps> = ({
  stateid,
  countryid,
  candisable = false,
  apiFetch,
  onUpdate
}) => {
  const [states, setStates] = useState<StateItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiFetch || !countryid) {
      setStates([]);
      return;
    }

    let isMounted = true;

    const fetchStates = async () => {
      setLoading(true);
      try {
        const payload = {
          Params: [{ Key: 2, Value: countryid }],
          PageContext: { PageSize: 1000, PageNumber: 1 }
        };

        const res = await apiFetch('generalmaster/StateMaster/GetStateMasters', payload);
        if (isMounted && res && res.Data) {
          setStates(res.Data);
        }
      } catch (err) {
        console.error("Failed to load states", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStates();

    return () => { isMounted = false; };
  }, [apiFetch, countryid]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onUpdate) return;
    const selectedId = parseInt(e.target.value, 10);
    const selectedState = states.find(s => s.Id === selectedId);

    if (selectedState) {
      onUpdate({
        stateid: selectedId,
        state: selectedState.StateName,
        districtid: -1,
        district: '',
        cityid: -1,
        city: '',
        area: '',
        areaid: -1,
        pincodeid: -1,
        pincode: ''
      });
    } else {
      onUpdate({
        stateid: null,
        state: '',
        districtid: -1,
        district: '',
        cityid: -1,
        city: '',
        area: '',
        areaid: -1,
        pincodeid: -1,
        pincode: ''
      });
    }
  };

  return (
    <select
      disabled={candisable || loading}
      value={stateid || ''}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '6px 12px',
        fontSize: '14px',
        lineHeight: '1.42857143',
        color: '#555',
        backgroundColor: candisable ? '#eee' : '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075)',
        transition: 'border-color ease-in-out .15s,box-shadow ease-in-out .15s'
      }}
    >
      <option value="">{loading ? "Loading states..." : "Select State"}</option>
      {states.map(s => (
        <option key={s.Id} value={s.Id}>
          {s.StateName}
        </option>
      ))}
    </select>
  );
};
