import React, { useState, useEffect } from 'react';

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
    if (!districtid) {
      setCities([]);
      return;
    }

    let isMounted = true;

    const fetchCities = async () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onUpdate) return;
    const selectedId = parseInt(e.target.value, 10);
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
    <select
      disabled={candisable || loading}
      value={cityid || ''}
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
      <option value="">{loading ? "Loading cities..." : "Select City"}</option>
      {cities.map(c => (
        <option key={c.Id} value={c.Id}>
          {c.CityName}
        </option>
      ))}
    </select>
  );
};
