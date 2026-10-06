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
export function DrPaymentModifyDatesScreen({ reactProps, onAction }: DrPaymentModifyFilterScreenProps) {
  const currentfilter = reactProps?.currentfilter || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
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
    </>
  );
}

export function DrPaymentModifyBillingTypeScreen({ reactProps, onAction }: DrPaymentModifyFilterScreenProps) {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const billTypeOptions = (lookup.BillType || []).map((o) => ({ value: String(o.Id), label: o.Text }));

  return (
    <>
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
      <div className="col-sm-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          onClick={() => dispatch('reset')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#334155',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '34px',
            fontWeight: 500,
          }}
          title="Reset Filters"
        >
          <i className="fa fa-refresh" style={{ fontSize: '13px', color: '#2563eb' }}></i>
          <span>Reset</span>
        </button>
        <button
          id="btnCancelForm"
          type="button"
          className="draftbutton"
          onClick={() => dispatch('fetch')}
          style={{
            padding: '6px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            height: '34px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          Fetch
        </button>
      </div>
    </>
  );
}

export function DrPaymentModifyFilterScreen(props: DrPaymentModifyFilterScreenProps & { part?: string }) {
  if (props.part === 'dates') {
    return <DrPaymentModifyDatesScreen {...props} />;
  }
  if (props.part === 'billingType') {
    return <DrPaymentModifyBillingTypeScreen {...props} />;
  }

  return (
    <>
      <div className="drhms-table-head-border">
        <DrPaymentModifyDatesScreen {...props} />
      </div>
      <div className="drhms-table-head-border">
        <DrPaymentModifyBillingTypeScreen {...props} />
      </div>
    </>
  );
}
