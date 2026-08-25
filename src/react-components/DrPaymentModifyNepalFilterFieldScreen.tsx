import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Input } from '../components/ui/Input';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DrPaymentModifyNepalFilterFieldScreenProps {
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string | Date;
      ToBillDate?: string | Date;
      PatientMrn?: string;
      EncounterTypeId?: number;
    };
    // lookup.EncounterType is never populated by this screen's initLookup()
    // (only the "BillType" key is requested) -- this select is confirmed
    // dead/always-empty, reproduced as-is.
    lookup?: { EncounterType?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
  // Which single control this mount renders. Each field keeps its own
  // native <td> wrapper in the surrounding AngularJS table template (see
  // drpaymentmodifynepal.html) -- only the control itself is React, since a
  // bare <react-component> cannot safely sit as a direct <tr> child (it
  // would be foster-parented out of the table by HTML table-parsing rules).
  // One shared component keyed by `field` avoids six near-identical files.
  field: 'fromDate' | 'toDate' | 'patientMrn' | 'encounterType' | 'reset' | 'fetch';
}

function toDateTimeInputValue(d?: string | Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DrPaymentModifyNepalFilterFieldScreen({ reactProps, onAction, field }: DrPaymentModifyNepalFilterFieldScreenProps) {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (field === 'fromDate') {
    return (
      <DatePicker
        includeTime
        value={toDateTimeInputValue(currentfilter.FromBillDate)}
        onChange={(v) => dispatch('fromDateChange', { value: v })}
      />
    );
  }

  if (field === 'toDate') {
    return (
      <DatePicker
        includeTime
        value={toDateTimeInputValue(currentfilter.ToBillDate)}
        onChange={(v) => dispatch('toDateChange', { value: v })}
      />
    );
  }

  if (field === 'patientMrn') {
    return (
      <Input
        type="text"
        value={currentfilter.PatientMrn || ''}
        placeholder="UHID / Name"
        onChange={(e) => dispatch('patientMrnChange', { value: e.target.value })}
        onKeyDown={(e) => {
          // Reproduces the original on-enter="getList()" directive.
          if (e.key === 'Enter') dispatch('fetch');
        }}
      />
    );
  }

  if (field === 'encounterType') {
    const options = (lookup.EncounterType || []).map((o) => ({ value: String(o.Id), label: o.Text }));
    return (
      <Select
        options={options}
        value={currentfilter.EncounterTypeId != null ? String(currentfilter.EncounterTypeId) : ''}
        onChange={(v) => dispatch('encounterTypeChange', { value: v ? Number(v) : null })}
      />
    );
  }

  if (field === 'reset') {
    return (
      <a onClick={() => dispatch('reset')} style={{ cursor: 'pointer' }}>
        <i className="fa fa-refresh" style={{ fontSize: 25, color: '#0066ff' }} title="Reset"></i>
      </a>
    );
  }

  // field === 'fetch'
  return (
    <button id="btnCancelForm" type="button" className="draftbutton" onClick={() => dispatch('fetch')}>
      Fetch
    </button>
  );
}
