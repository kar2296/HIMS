import React, { useMemo } from 'react';
import { colors } from '../components/ui/tokens';

interface AgeDisplayProps {
  dob?: string | Date | null;
}

export const AgeDisplay: React.FC<AgeDisplayProps> = ({ dob }) => {
  const ageString = useMemo(() => {
    if (!dob) return '';

    try {
      const now = new Date();
      const birthDate = new Date(dob);

      if (isNaN(birthDate.getTime())) return '';

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

      if (yearAge > 0 && monthAge > 0 && dateAge > 0) return `${yearAge}Y ${monthAge}M ${dateAge}D`;
      if (yearAge === 0 && monthAge === 0 && dateAge > 0) return `${dateAge}D`;
      if (yearAge > 0 && monthAge === 0 && dateAge === 0) return `${yearAge}Y`;
      if (yearAge > 0 && monthAge > 0 && dateAge === 0) return `${yearAge}Y ${monthAge}M`;
      if (yearAge === 0 && monthAge > 0 && dateAge > 0) return `${monthAge}M ${dateAge}D`;
      if (yearAge > 0 && monthAge === 0 && dateAge > 0) return `${yearAge}Y ${dateAge}D`;
      if (yearAge === 0 && monthAge > 0 && dateAge === 0) return `${monthAge}M`;

      return '';
    } catch {
      return '';
    }
  }, [dob]);

  return <span style={{ fontWeight: 600, color: colors.textMain }}>{ageString}</span>;
};
