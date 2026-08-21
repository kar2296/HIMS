import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { Select } from '../components/ui/Select';

interface DistrictItem {
  Id: number;
  DistrictName: string;
}

interface DistrictControlProps {
  districtid?: number | null;
  countryid?: number | null;
  stateid?: number | null;
  candisable?: boolean;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const DistrictControl: React.FC<DistrictControlProps> = ({
  districtid,
  countryid,
  stateid,
  candisable = false,
  onUpdate
}) => {
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDistricts = async () => {
      if (!stateid) {
        if (isMounted) setDistricts([]);
        return;
      }

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
  }, [countryid, stateid]);

  const handleChange = (value: string | number) => {
    if (!onUpdate) return;
    const selectedId = parseInt(String(value), 10);
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
    <Select
      disabled={candisable}
      loading={loading}
      value={districtid || ''}
      onChange={handleChange}
      placeholder={loading ? "Loading districts..." : "Select District"}
      options={districts.map(d => ({ value: d.Id, label: d.DistrictName }))}
    />
  );
};
