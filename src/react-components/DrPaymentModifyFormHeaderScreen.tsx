interface DrPaymentModifyFormHeaderScreenProps {
  reactProps?: {
    item?: { oldDrName?: string };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export function DrPaymentModifyFormHeaderScreen({ reactProps, onAction }: DrPaymentModifyFormHeaderScreenProps) {
  const item = reactProps?.item || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="modal-header custom-modal-header">
        <h4 className="col-sm-11 mt0">Change Dr.</h4>
        <button
          id="btnCancelForm"
          style={{ width: 33 }}
          type="button"
          className="col-sm-1 btn btn-danger btn-sm"
          onClick={() => dispatch('cancel')}
        >
          X
        </button>
      </div>
      <div className="col-sm-4 form-group paddingtop">
        <div className="col-sm-12">
          <label className="col-sm-12 control-label">Dr. Name</label>
          <div className="col-sm-12">
            <input type="text" className="form-control" disabled value={item.oldDrName || ''} readOnly />
          </div>
        </div>
      </div>
    </>
  );
}
