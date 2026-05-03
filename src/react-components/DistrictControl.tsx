import React, { useState, useEffect } from 'react';

interface DistrictItem {
  Id: number;
  DistrictName: string;
}

interface DistrictControlProps {
  districtid?: number | null;
  countryid?: number | null;
  stateid?: number | null;
  candisable?: boolean;
  apiFetch?: (action: string, payload: any) => Promise<any>;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const DistrictControl: React.FC<DistrictControlProps> = ({
  districtid,
  countryid,
  stateid,
  candisable = false,
  apiFetch,
  onUpdate
}) => {
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiFetch || !stateid) {
      setDistricts([]);
      return;
    }

    let isMounted = true;

    const fetchDistricts = async () => {
      setLoading(true);
      try {
        const payload = {
          Params: [
            { Key: 5, Value: countryid || null },
            { Key: 2, Value: stateid }
          ],
          PageContext: { PageSize: 1000, PageNumber: 1 }
        };

        const res = await apiFetch('generalmaster/DistrictMaster/GetDistrictMasters', payload);
        if (isMounted && res && res.Data) {
          setDistricts(res.Data);
        }
      } catch (err) {
        console.error("Failed to load districts", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDistricts();

    return () => { isMounted = false; };
  }, [apiFetch, countryid, stateid]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onUpdate) return;
    const selectedId = parseInt(e.target.value, 10);
    const selectedDistrict = districts.find(d => d.Id === selectedId);

    if (selectedDistrict) {
      onUpdate({
        districtid: selectedId,
        district: selectedDistrict.DistrictName,
        cityid: -1,
        city: '',
        area: '',
        areaid: -1,
        pincodeid: -1,
        pincode: ''
      });
    } else {
      onUpdate({
        districtid: null,
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
      value={districtid || ''}
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
      <option value="">{loading ? "Loading districts..." : "Select District"}</option>
      {districts.map(d => (
        <option key={d.Id} value={d.Id}>
          {d.DistrictName}
        </option>
      ))}
    </select>
  );
};
