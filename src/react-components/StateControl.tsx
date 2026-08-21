import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { Select } from '../components/ui/Select';

interface StateItem {
  Id: number;
  StateName: string;
}

interface StateControlProps {
  stateid?: number | null;
  countryid?: number | null;
  candisable?: boolean;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const StateControl: React.FC<StateControlProps> = ({
  stateid,
  countryid,
  candisable = false,
  onUpdate
}) => {
  const [states, setStates] = useState<StateItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchStates = async () => {
      if (!countryid) {
        if (isMounted) setStates([]);
        return;
      }

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
  }, [countryid]);

  const handleChange = (rawValue: string | number) => {
    if (!onUpdate) return;
    const selectedId = parseInt(String(rawValue), 10);
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
    <Select
      disabled={candisable}
      loading={loading}
      value={stateid || ''}
      onChange={handleChange}
      placeholder={loading ? "Loading states..." : "Select State"}
      options={states.map(s => ({ value: s.Id, label: s.StateName }))}
    />
  );
};
