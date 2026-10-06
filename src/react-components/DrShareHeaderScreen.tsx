import React from 'react';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from './Button';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DrShareHeaderScreenProps {
  reactProps?: {
    currentfilter?: {
      DoctorClassId?: number;
      DoctorClassName?: string;
      EncounterTypeId?: number;
      EncounterTypeName?: string;
      ShareTypeId?: number;
      ShareTypeName?: string;
      ActiveFrom?: string;
      ActiveTo?: string;
    };
    lookup?: {
      DoctorClass?: LookupItem[];
      EncounterType?: LookupItem[];
      ShareType?: LookupItem[];
    };
    DoctorShareClass?: number;
    currentcontext?: { SelectedOption?: number };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Matches the original uib-datepicker-popup binding (date-only, no time
// component -- distinct from the Nepal screens' datetime-picker).
function toDateInputValue(d?: string | Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDisplayDate(d?: string): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
}

// React bridge migration (hybrid). This mount replaces the two header
// filter-area <div>s and the tab-switcher button group in
// doctorshareform.html. It has no native-only widgets of its own (the
// Items tab's native <autosearch> lives further down, outside this
// mount) and no utl.Validator.validate($scope) call in this controller.
//
// Confirmed pre-existing quirk, reproduced as-is: the editable header
// form is NEVER hidden by the original template (no ng-if on it) --
// clicking "Add" (addDoctorShare()) sets DoctorShareClass=1 and reveals
// a SECOND, read-only summary block UNDERNEATH the still-editable form,
// rather than replacing it. Both are shown at once once locked; this is
// reproduced verbatim rather than "fixed" into a single toggled view.
export const DrShareHeaderScreen: React.FC<DrShareHeaderScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const doctorShareClass = reactProps?.DoctorShareClass ?? 0;
  const selectedOption = reactProps?.currentcontext?.SelectedOption ?? 1;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const doctorClassOptions = (lookup.DoctorClass || []).map((o) => ({ value: o.Id, label: o.Text }));
  const encounterTypeOptions = (lookup.EncounterType || []).map((o) => ({ value: o.Id, label: o.Text }));
  const shareTypeOptions = (lookup.ShareType || []).map((o) => ({ value: o.Id, label: o.Text }));

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: 4, border: 'none', cursor: 'pointer',
    backgroundColor: active ? '#8dc51fbf' : '#e9ecef', fontWeight: 700, fontSize: '13px', marginRight: 12,
  });

  return (
    <div className="row filter-area">
      <div className="col-sm-12">
        <div className="col-sm-4">
          <label className="col-sm-5 control-label filter-lbl">Doctor Class</label>
          <div className="col-sm-7">
            <Select
              options={doctorClassOptions}
              value={currentfilter.DoctorClassId ?? -1}
              onChange={(v) => dispatch('doctorClassChange', { value: Number(v) })}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <label className="col-sm-5 control-label filter-lbl">Active From</label>
          <div className="col-sm-7">
            <DatePicker
              value={toDateInputValue(currentfilter.ActiveFrom)}
              onChange={(v) => dispatch('activeFromChange', { value: v })}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <label className="col-sm-5 control-label filter-lbl">Visit Type</label>
          <div className="col-sm-7">
            <Select
              options={encounterTypeOptions}
              value={currentfilter.EncounterTypeId ?? 1}
              onChange={(v) => dispatch('encounterTypeChange', { value: Number(v) })}
            />
          </div>
        </div>
      </div>

      <div className="col-sm-12">
        <div className="col-sm-4">
          <label className="col-sm-5 control-label filter-lbl">Fee Type</label>
          <div className="col-sm-7">
            <Select
              options={shareTypeOptions}
              value={currentfilter.ShareTypeId ?? -1}
              onChange={(v) => dispatch('shareTypeChange', { value: Number(v) })}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <label className="col-sm-5 control-label filter-lbl">Active To</label>
          <div className="col-sm-7">
            <DatePicker
              value={toDateInputValue(currentfilter.ActiveTo)}
              onChange={(v) => dispatch('activeToChange', { value: v })}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <Button variant="secondary" size="xs" className="pull-right btn-filter" icon="fa-plus" onClick={() => dispatch('clear')}>
            Clear
          </Button>
          <Button variant="secondary" size="xs" className="pull-right btn-filter" icon="fa-plus" onClick={() => dispatch('add')} style={{ marginRight: 8 }}>
            Add
          </Button>
        </div>
      </div>

      {doctorShareClass === 1 && (
        <>
          <div className="col-sm-12">
            <div className="col-sm-4">
              <label className="col-sm-5 control-label filter-lbl">Doctor Class</label>
              <div className="col-sm-7"><span><strong>{currentfilter.DoctorClassName}</strong></span></div>
            </div>
            <div className="col-sm-4">
              <label className="col-sm-5 control-label filter-lbl">Active From</label>
              <div className="col-sm-7"><span><strong>{formatDisplayDate(currentfilter.ActiveFrom)}</strong></span></div>
            </div>
            <div className="col-sm-4">
              <label className="col-sm-5 control-label filter-lbl">Visit Type</label>
              <div className="col-sm-7"><span><strong>{currentfilter.EncounterTypeName}</strong></span></div>
            </div>
          </div>
          <div className="col-sm-12">
            <div className="col-sm-4">
              <label className="col-sm-5 control-label filter-lbl">Fee Type</label>
              <div className="col-sm-7"><span><strong>{currentfilter.ShareTypeName}</strong></span></div>
            </div>
            <div className="col-sm-4">
              <label className="col-sm-5 control-label filter-lbl">Active To</label>
              <div className="col-sm-7"><span><strong>{formatDisplayDate(currentfilter.ActiveTo)}</strong></span></div>
            </div>
            <div className="col-sm-4"></div>
          </div>

          <div className="col-xs-12 col-sm-12 btn-group cust_btnouter clearfix" style={{ marginTop: 12 }}>
            <button type="button" style={tabBtnStyle(selectedOption === 1)} onClick={() => dispatch('selectCategory')} title="Category">
              Category
            </button>
            <button type="button" style={tabBtnStyle(selectedOption === 2)} onClick={() => dispatch('selectItems')} title="Items">
              Items
            </button>
            <button type="button" style={tabBtnStyle(selectedOption === 3)} onClick={() => dispatch('selectPayoutRange')} title="PayoutRange">
              Payout Range
            </button>
          </div>
        </>
      )}
    </div>
  );
};
