import React from 'react';
import { spacing } from './../components/ui/tokens';

interface LookupOption {
  Id: number;
  Text: string;
}

interface CurrentFilterShape {
  DoctorId?: string | number[];
  AppointmentStatusId?: number[] | null;
}

interface LookupShape {
  Doctor?: LookupOption[];
  AppointmentStatus?: LookupOption[];
}

interface ReactPropsShape {
  currentfilter?: CurrentFilterShape;
  lookup?: LookupShape;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const dispatchOf = (onAction?: (a: string, p?: any) => void) => (action: string, payload?: any) => {
  onAction?.(action, payload);
};

// React bridge migration for appointmentcalendar/appointmentcalendarnew.js
// (`appointmentscalendarController`, states `app.appointmentcalendarnew` +
// the `.appointmentcalendardoctor` tab). This screen's centerpiece is a full
// jQuery `fullCalendar` widget (month/week/day views, drag-to-select,
// double-click-to-edit, hover tooltips, wired via this file's own
// `calendarDirective`) alongside a native jQuery-UI `#datepicker` that drives
// it via `$('#calendar').fullCalendar('gotoDate', ...)`. Both are left
// completely native/untouched -- same REUSABLE-SUB-WIDGET-PATTERN precedent
// as every jqx-scheduler screen in this project (doctordashboard.js,
// appointment-form.js, appointments-form.js): reimplementing a 3rd-party
// calendar library wired this directly to jQuery is out of scope and high
// regression risk for zero behavioral gain. Only the two mounts below --
// genuinely static/simple chrome around the calendar -- are migrated:
//  - AppointmentCalendarFilterBar: the Doctor multiselect + "Fetch" button
//    from the top row (the page header "Appoinment Calendar" -- typo in the
//    real translate key, kept verbatim -- stays native, it's inert text).
//  - AppointmentCalendarStatusFilter: the Appointment Status checkbox list
//    (`ng-repeat` over `lookup.AppointmentStatus`, skipping `Id === -1`) from
//    the left column, immediately above the (native, untouched) `#datepicker`
//    div.
//
// CONFIRMED REAL PRE-EXISTING BUG in the Doctor multiselect, reproduced not
// fixed: the real `<multiselectchk>` vendor widget's `selected` two-way
// binding (`vendor/components/multiselectchk.js`) treats the bound value as
// a COMMA-SEPARATED STRING on both read (`cvm.selected.split(",")` inside its
// own `$watch`) and write (`cvm.selected = selectedIds.join()`) -- but this
// controller initializes `currentfilter.DoctorId` as an ARRAY
// (`[utl.Session.getCurrentUserId()]` or `[]`). Arrays have no `.split`
// method, so the widget's internal watch throws a TypeError the very first
// time it fires (Angular swallows/logs watch exceptions and keeps running),
// meaning `cvm.selectedArr` is NEVER populated from the real initial
// `DoctorId` -- the widget always renders with nothing checked on load,
// regardless of the actual filter value. Reproduced faithfully: this
// component always starts with no doctor selected, never pre-selecting the
// physician-user default the controller tries (and fails) to seed. Also
// confirmed: the real `<multiselectchk>` tag on THIS screen has no `change=`
// attribute at all, so selecting doctors updates `currentfilter.DoctorId`
// (now as a string, since the widget writes back a joined string) but never
// triggers a live refetch -- the user must click "Fetch" afterward for a
// doctor-filter change to take effect. Reproduced: no dispatch-time
// `getList()` call on doctor-selection change, only on 'fetchClick'.
//
// The Appointment Status checkboxes ARE properly wired in the original
// (`toggleAppSelection` uses real array push/splice + calls `getList()`
// itself), so that mount dispatches a real immediate refetch on every
// toggle, matching the source exactly.
export const AppointmentCalendarFilterBar: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const lookup = reactProps?.lookup || {};
  const dispatch = dispatchOf(onAction);

  return (
    <>
      <div className="col-sm-3">
        <label className="col-sm-12">Doctor</label>
        <div className="col-sm-12">
          <MultiSelectCheckboxFilter
            list={lookup.Doctor || []}
            // Always renders empty -- see the disclosed read-side bug above,
            // faithfully reproduced rather than "fixed" by pre-selecting.
            selected=""
            onChange={(value) => dispatch('doctorFilterChange', { value })}
          />
        </div>
      </div>
      <div className="col-sm-2">
        <label className="col-sm-12">Click</label>
        <div className="col-sm-12">
          <button type="button" className="draftbutton" onClick={() => dispatch('fetchClick')}>Fetch</button>
        </div>
      </div>
    </>
  );
};

// Local reproduction of the real `<multiselectchk>` vendor widget's OUTPUT
// shape (comma-separated string), matching the established per-file
// convention already duplicated in AllInpatientListScreen.tsx/
// CurrentInpatientScreen.tsx/AppointmentsListScreen.tsx/
// ViewAppointmentScreen.tsx (no shared design-system multi-select exists
// yet). Unlike those screens, this one never reflects a `selected` value
// back into the checkboxes (see the disclosed read-side bug above) -- always
// rendered with `selected=""` by the caller.
const MultiSelectCheckboxFilter: React.FC<{
  list: LookupOption[];
  selected?: string;
  onChange: (value: string) => void;
}> = ({ list, selected, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedIds = (selected || '').split(',').filter(Boolean).map((s) => parseInt(s, 10));

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: number) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange(next.join(','));
  };

  const summary = selectedIds.length === 0
    ? 'None selected'
    : selectedIds.length <= 3
      ? list.filter((l) => selectedIds.includes(l.Id)).map((l) => l.Text).join(', ')
      : `${selectedIds.length} selected`;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 32, padding: '0 10px', fontSize: '13px',
          backgroundColor: '#fff', border: `1px solid ${open ? '#03f' : '#ccc'}`,
          borderRadius: 4, cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '10px' }} />
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000,
          backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto',
        }}>
          {list.length === 0 && <div style={{ padding: '8px 10px', fontSize: '12px' }}>No options</div>}
          {list.map((item) => (
            <label
              key={item.Id}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}
            >
              <input type="checkbox" checked={selectedIds.includes(item.Id)} onChange={() => toggle(item.Id)} />
              {item.Text}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const AppointmentCalendarStatusFilter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const dispatch = dispatchOf(onAction);
  const selectedIds = currentfilter.AppointmentStatusId || [];
  const items = (lookup.AppointmentStatus || []).filter((a) => a.Id !== -1);

  return (
    <>
      <label className="col-sm-12 mt10">Appointment Status</label>
      <div className="col-sm-12" style={{ maxHeight: 200, overflowY: 'auto' }}>
        {items.map((appointment) => (
          <div key={appointment.Id}>
            <label>
              <input
                type="checkbox"
                checked={selectedIds.indexOf(appointment.Id) > -1}
                onChange={() => dispatch('statusToggle', { id: appointment.Id })}
              />
              {' '}{appointment.Text}
            </label>
          </div>
        ))}
      </div>
    </>
  );
};
