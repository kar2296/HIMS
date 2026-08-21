import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { Select } from '../components/ui/Select';

interface CityItem {
  Id: number;
  CityName: string;
}

interface CityControlProps {
  cityid?: number | null;
  countryid?: number | null;
  stateid?: number | null;
  districtid?: number | null;
  candisable?: boolean;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const CityControl: React.FC<CityControlProps> = ({
  cityid,
  countryid,
  stateid,
  districtid,
  candisable = false,
  onUpdate
}) => {
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCities = async () => {
      if (!districtid) {
        if (isMounted) setCities([]);
        return;
      }

      setLoading(true);
      try {
        const payload = {
          Params: [
            { Key: 5, Value: countryid || null },
            { Key: 2, Value: stateid || null },
            { Key: 3, Value: districtid }
          ],
          PageContext: { PageSize: 1000, PageNumber: 1 }
        };

        const res = await apiFetch('generalmaster/CityMaster/GetCityMasters', payload);
        if (isMounted && res && res.Data) {
          setCities(res.Data);
        }
      } catch (err) {
        console.error("Failed to load cities", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCities();

    return () => { isMounted = false; };
  }, [countryid, stateid, districtid]);

  const handleChange = (selectedValue: string | number) => {
    if (!onUpdate) return;
    const selectedId = parseInt(String(selectedValue), 10);
    const selectedCity = cities.find(c => c.Id === selectedId);

    if (selectedCity) {
      onUpdate({
        cityid: selectedId,
        city: selectedCity.CityName,
        pincodeid: -1,
        pincode: '',
        area: '',
        areaid: -1
      });
    } else {
      // Cleared selection
      onUpdate({
        cityid: null,
        city: '',
        pincodeid: -1,
        pincode: '',
        area: '',
        areaid: -1
      });
    }
  };

  return (
    <Select
      disabled={candisable || loading}
      loading={loading}
      value={cityid || ''}
      onChange={handleChange}
      placeholder={loading ? "Loading cities..." : "Select City"}
      options={cities.map(c => ({ value: c.Id, label: c.CityName }))}
    />
  );
};
