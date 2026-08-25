import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DrPaymentModifyFilterScreenProps {
  reactProps?: {
    currentfilter?: { BillTypeId?: number; FromBillDate?: string | Date; ToBillDate?: string | Date };
    lookup?: { BillType?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// FromBillDate/ToBillDate are bound via ng-date-object (a real JS Date
// object) through uib-datepicker-popup -- a date-only picker (no time
// component), unlike the datetime-picker directive used elsewhere in this
// migration.
function toDateInputValue(d?: string | Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Renders as TWO sibling .drhms-table-head-border boxes (not one merged
// box) to preserve the original template's 3-box grid layout: box #1 (kept
// native, holds the ServiceId autosearch + Bill No -- see
// DrPaymentModifyBillNoScreen), box #2 (Dates, this component), box #3
// (Billing Type + Reset/Fetch, this component).
export function DrPaymentModifyFilterScreen({ reactProps, onAction }: DrPaymentModifyFilterScreenProps) {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const billTypeOptions = (lookup.BillType || []).map((o) => ({ value: String(o.Id), label: o.Text }));

  return (
    <>
      <div className="drhms-table-head-border">
        <div className="col-sm-12">
          <label className="col-sm-4">From Date</label>
          <div className="col-sm-8">
            <DatePicker
              value={toDateInputValue(currentfilter.FromBillDate)}
              onChange={(v) => dispatch('fromDateChange', { value: v })}
            />
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">To Date</label>
          <div className="col-sm-8">
            <DatePicker
              value={toDateInputValue(currentfilter.ToBillDate)}
              onChange={(v) => dispatch('toDateChange', { value: v })}
            />
          </div>
        </div>
      </div>
      <div className="drhms-table-head-border">
        <div className="col-sm-12">
          <label className="col-sm-4">Billing Type</label>
          <div className="col-sm-8">
            <Select
              options={billTypeOptions}
              value={currentfilter.BillTypeId != null ? String(currentfilter.BillTypeId) : ''}
              onChange={(v) => dispatch('billTypeChange', { value: v ? Number(v) : null })}
            />
          </div>
        </div>
        <div className="col-sm-12">
          <a onClick={() => dispatch('reset')} style={{ cursor: 'pointer' }}>
            <i
              className="fa fa-refresh"
              style={{ fontSize: 25, color: '#0066ff', margin: '0px 25px' }}
              title="Reset"
            ></i>
          </a>
          <button id="btnCancelForm" type="button" className="draftbutton" onClick={() => dispatch('fetch')}>
            Fetch
          </button>
        </div>
      </div>
    </>
  );
}
