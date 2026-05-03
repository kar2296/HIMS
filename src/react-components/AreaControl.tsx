import React, { useState, useEffect } from 'react';

interface AreaItem {
  Id: number;
  Area: string;
}

interface AreaControlProps {
  areaid?: number | null;
  cityid?: number | null;
  stateid?: number | null;
  districtid?: number | null;
  countryid?: number | null;
  pincode?: string;
  candisable?: boolean;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const AreaControl: React.FC<AreaControlProps> = ({
  areaid,
  cityid,
  stateid,
  districtid,
  countryid,
  pincode,
  candisable = false,
  onUpdate
}) => {
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cityid) {
      setAreas([]);
      return;
    }

    let isMounted = true;

    const fetchAreas = async () => {
      if (pincode === 'freetext') return;

      setLoading(true);
      try {
        const payload = {
          Params: [
            { Key: 2, Value: countryid || null },
            { Key: 3, Value: stateid || null },
            { Key: 9, Value: districtid || null },
            { Key: 4, Value: cityid }
          ],
          PageContext: { PageSize: 1000, PageNumber: 1 }
        };

        const res = await apiFetch('generalmaster/PincodeMaster/GetPincodeMasters', payload);
        if (isMounted && res && res.Data) {
          const formattedAreas = res.Data.map((item: any) => ({
            Id: item.Id,
            Area: item.Area
          }));
          setAreas(formattedAreas);
        }
      } catch (err) {
        console.error("Failed to load areas", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAreas();

    return () => { isMounted = false; };
  }, [cityid, countryid, stateid, districtid, pincode]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onUpdate) return;
    const selectedId = parseInt(e.target.value, 10);
    const selectedArea = areas.find(a => a.Id === selectedId);

    if (selectedArea) {
      onUpdate({
        areaid: selectedId,
        area: selectedArea.Area,
        pincodeid: -1,
        pincode: ''
      });
    } else {
      onUpdate({
        areaid: null,
        area: '',
        pincodeid: -1,
        pincode: ''
      });
    }
  };

  return (
    <select
      disabled={candisable || loading}
      value={areaid || ''}
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
      <option value="">{loading ? "Loading areas..." : "Select Area"}</option>
      {areas.map(a => (
        <option key={a.Id} value={a.Id}>
          {a.Area}
        </option>
      ))}
    </select>
  );
};
