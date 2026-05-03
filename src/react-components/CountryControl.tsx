import React, { useState, useEffect } from 'react';

interface CountryItem {
  Id: number;
  CountryName: string;
}

interface CountryControlProps {
  countryid?: number | null;
  candisable?: boolean;
  apiFetch?: (action: string, payload: any) => Promise<any>;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const CountryControl: React.FC<CountryControlProps> = ({
  countryid,
  candisable = false,
  apiFetch,
  onUpdate
}) => {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiFetch) {
      setCountries([]);
      return;
    }

    let isMounted = true;

    const fetchCountries = async () => {
      setLoading(true);
      try {
        const payload = {
          Params: [],
          PageContext: { PageSize: 25, PageNumber: 1 }
        };

        const res = await apiFetch('generalmaster/CountryMaster/GetCountryMasters', payload);
        if (isMounted && res && res.Data) {
          setCountries(res.Data);
        }
      } catch (err) {
        console.error("Failed to load countries", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCountries();

    return () => { isMounted = false; };
  }, [apiFetch]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onUpdate) return;
    const selectedId = parseInt(e.target.value, 10);
    const selectedCountry = countries.find(c => c.Id === selectedId);

    if (selectedCountry) {
      onUpdate({
        countryid: selectedId,
        country: selectedCountry.CountryName,
        stateid: -1,
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
    } else {
      // Cleared selection
      onUpdate({
        countryid: null,
        country: '',
        stateid: -1,
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
      value={countryid || ''}
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
      <option value="">{loading ? "Loading countries..." : "Select Country"}</option>
      {countries.map(c => (
        <option key={c.Id} value={c.Id}>
          {c.CountryName}
        </option>
      ))}
    </select>
  );
};
