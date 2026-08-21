import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { Select } from '../components/ui/Select';

interface CountryItem {
  Id: number;
  CountryName: string;
}

interface CountryControlProps {
  countryid?: number | null;
  candisable?: boolean;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const CountryControl: React.FC<CountryControlProps> = ({
  countryid,
  candisable = false,
  onUpdate
}) => {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleChange = (value: string | number) => {
    if (!onUpdate) return;
    const selectedId = parseInt(String(value), 10);
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
    <Select
      disabled={candisable || loading}
      loading={loading}
      value={countryid || ''}
      onChange={handleChange}
      placeholder={loading ? "Loading countries..." : "Select Country"}
      options={countries.map(c => ({ value: c.Id, label: c.CountryName }))}
    />
  );
};
