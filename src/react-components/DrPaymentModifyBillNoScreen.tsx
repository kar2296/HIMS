interface DrPaymentModifyBillNoScreenProps {
  reactProps?: {
    currentfilter?: { BillNumber?: string };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Mounted as a sibling of the native <autosearch> ServiceId widget inside
// the same .drhms-table-head-border box as the original template -- kept
// as its own tiny mount because it must sit next to that live native
// element, not because the field itself needs its own component.
export function DrPaymentModifyBillNoScreen({ reactProps, onAction }: DrPaymentModifyBillNoScreenProps) {
  const currentfilter = reactProps?.currentfilter || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="col-sm-12">
      <label className="col-sm-4">Bill No</label>
      <div className="col-sm-8">
        <input
          type="text"
          className="form-control"
          name="filter_code"
          placeholder="Bill No"
          value={currentfilter.BillNumber || ''}
          onChange={(e) => dispatch('billNumberChange', { value: e.target.value })}
          onKeyDown={(e) => {
            // Reproduces the original on-enter="getList()" directive.
            if (e.key === 'Enter') dispatch('fetch');
          }}
        />
      </div>
    </div>
  );
}
