import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { Select } from '../components/ui/Select';

interface PincodeItem {
  Id: number;
  Pincode: string;
  Area: string;
  AreaId: number;
  CityId: number;
  City: string;
  DistrictId: number;
  District: string;
  StateId: number;
  State: string;
  CountryId: number;
  Country: string;
}

interface PincodeControlProps {
  pincodeid?: number | null;
  pincode?: string;
  cityid?: number | null;
  stateid?: number | null;
  districtid?: number | null;
  countryid?: number | null;
  candisable?: boolean;
  onUpdate?: (updates: Record<string, any>) => void;
}

export const PincodeControl: React.FC<PincodeControlProps> = ({
  pincodeid,
  pincode,
  cityid,
  stateid,
  districtid,
  countryid,
  candisable = false,
  onUpdate
}) => {
  const [pincodes, setPincodes] = useState<PincodeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPincodes = async () => {
      if (!cityid) {
        if (isMounted) setPincodes([]);
        return;
      }
      if (pincode === 'freetext') return; // Preserved legacy behavior

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
          const formattedPincodes = res.Data.map((item: any) => ({
            Id: item.Id,
            Pincode: item.Pincode,
            Area: item.Area,
            AreaId: item.Id,
            CityId: item.CityId,
            City: item.CityMaster?.CityName || '',
            DistrictId: item.DistrictId,
            District: item.DistrictMaster?.DistrictName || '',
            StateId: item.StateId,
            State: item.StateMaster?.StateName || '',
            CountryId: item.CountryId,
            Country: item.CountryMaster?.CountryName || ''
          }));
          setPincodes(formattedPincodes);
        }
      } catch (err) {
        console.error("Failed to load pincodes", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPincodes();

    return () => { isMounted = false; };
  }, [cityid, countryid, stateid, districtid, pincode]);

  // NOTE: signature adapted from the raw <select> ChangeEvent handler to the
  // design-system Select's `onChange(value)` contract -- the selection logic
  // below (parseInt + lookup + onUpdate payload) is byte-for-byte unchanged.
  const handleChange = (rawValue: string | number) => {
    if (!onUpdate) return;
    const selectedId = parseInt(String(rawValue), 10);
    const selectedPincode = pincodes.find(p => p.Id === selectedId);

    if (selectedPincode) {
      onUpdate({
        pincodeid: selectedPincode.Id,
        pincode: selectedPincode.Pincode,
        area: selectedPincode.Area,
        areaid: selectedPincode.AreaId,
        city: selectedPincode.City,
        cityid: selectedPincode.CityId,
        district: selectedPincode.District,
        districtid: selectedPincode.DistrictId,
        state: selectedPincode.State,
        stateid: selectedPincode.StateId,
        country: selectedPincode.Country,
        countryid: selectedPincode.CountryId
      });
    } else {
      onUpdate({
        pincodeid: null,
        pincode: '',
        area: '',
        areaid: null
      });
    }
  };

  return (
    <Select
      disabled={candisable}
      loading={loading}
      value={pincodeid || ''}
      onChange={handleChange}
      placeholder={loading ? "Loading areas..." : "Select Area/Pincode"}
      options={pincodes.map(p => ({
        value: p.Id,
        label: `${p.Pincode} - ${p.Area}`
      }))}
    />
  );
};
