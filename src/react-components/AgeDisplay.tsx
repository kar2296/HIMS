import React, { useState, useEffect } from 'react';

interface AgeDisplayProps {
  dob?: string | Date | null;
}

export const AgeDisplay: React.FC<AgeDisplayProps> = ({ dob }) => {
  const [ageString, setAgeString] = useState<string>('');

  useEffect(() => {
    if (!dob) {
      setAgeString('');
      return;
    }

    try {
      const now = new Date();
      const birthDate = new Date(dob);

      if (isNaN(birthDate.getTime())) {
        setAgeString('');
        return;
      }

      const yearNow = now.getFullYear();
      const monthNow = now.getMonth();
      const dateNow = now.getDate();

      const yearDob = birthDate.getFullYear();
      const monthDob = birthDate.getMonth();
      const dateDob = birthDate.getDate();

      let yearAge = yearNow - yearDob;
      let monthAge = 0;
      let dateAge = 0;

      if (monthNow >= monthDob) {
        monthAge = monthNow - monthDob;
      } else {
        yearAge--;
        monthAge = 12 + monthNow - monthDob;
      }

      if (dateNow >= dateDob) {
        dateAge = dateNow - dateDob;
      } else {
        monthAge--;
        // Approximate days in previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        dateAge = prevMonth.getDate() + dateNow - dateDob;

        if (monthAge < 0) {
          monthAge = 11;
          yearAge--;
        }
      }

      let finalString = "";
      if (yearAge > 0 && monthAge > 0 && dateAge > 0) finalString = `${yearAge}Y ${monthAge}M ${dateAge}D`;
      else if (yearAge === 0 && monthAge === 0 && dateAge > 0) finalString = `${dateAge}D`;
      else if (yearAge > 0 && monthAge === 0 && dateAge === 0) finalString = `${yearAge}Y`;
      else if (yearAge > 0 && monthAge > 0 && dateAge === 0) finalString = `${yearAge}Y ${monthAge}M`;
      else if (yearAge === 0 && monthAge > 0 && dateAge > 0) finalString = `${monthAge}M ${dateAge}D`;
      else if (yearAge > 0 && monthAge === 0 && dateAge > 0) finalString = `${yearAge}Y ${dateAge}D`;
      else if (yearAge === 0 && monthAge > 0 && dateAge === 0) finalString = `${monthAge}M`;

      setAgeString(finalString);
    } catch (e) {
      setAgeString('');
    }
  }, [dob]);

  return <span style={{ fontWeight: 500, color: '#333' }}>{ageString}</span>;
};
