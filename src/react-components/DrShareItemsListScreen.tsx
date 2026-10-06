import React from 'react';

interface ItemRow {
  ServiceId?: number;
  Name?: string;
  EligiblePer?: number | string;
  SharePer?: number | string;
  ShareAmt?: number | string;
  Status?: number;
}

interface DrShareItemsListScreenProps {
  reactProps?: {
    ItemDetails?: ItemRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const thStyle: React.CSSProperties = { backgroundColor: '#ccc', padding: '6px 10px', textAlign: 'left' };
const tdStyle: React.CSSProperties = { color: '#000', padding: '6px 10px', border: '1px solid #ddd' };

// React bridge migration (hybrid, partial): renders ONLY the results
// table and Save button for the Items tab (currentcontext.SelectedOption
// == 2). The entry row above it (native <autosearch> bound to
// vm.serviceitemcontrolconfig, searching ClinicalMaster/ServiceItem/
// GetServiceItems, plus its Eligible%/Share%/Amount inputs and Add
// button) is left as untouched, live AngularJS markup in
// doctorshareform.html -- splitting the autosearch out of its row would
// fragment one visual row across two rendering frameworks for no real
// benefit, matching the same hybrid precedent used elsewhere in this
// migration (e.g. lhrcvoucher-list.html's native filter row).
export const DrShareItemsListScreen: React.FC<DrShareItemsListScreenProps> = ({ reactProps, onAction }) => {
  const items = (reactProps?.ItemDetails || []).filter((r) => r.Status === 1);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="col-sm-12">
        <table className="col-sm-12 table-bordered table">
          <thead>
            <tr>
              <th style={thStyle}>Item Name</th>
              <th style={thStyle}>Eligible Percentage</th>
              <th style={thStyle}>Share Percentage</th>
              <th style={thStyle}>Share Amount</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{row.Name}</td>
                <td style={tdStyle}>{row.EligiblePer} %</td>
                <td style={tdStyle}>{row.SharePer} %</td>
                <td style={tdStyle}>{row.ShareAmt}</td>
                <td style={tdStyle}>
                  <button type="button" className="btn btn-primary btn-xs" tabIndex={-1} onClick={() => dispatch('editItemDetail', { serviceId: row.ServiceId })}>
                    <i className="fa fa-plus" aria-hidden="true" />
                  </button>{' '}
                  <button type="button" className="btn btn-danger btn-xs" tabIndex={-1} onClick={() => dispatch('deleteItemDetail', { serviceId: row.ServiceId })}>
                    <img className="drhms-edit-button" src="assets/svg/delete.svg" alt="" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="col-sm-12 site-footer panel-footer">
        <div className="footer-right">
          <button type="button" className="btn dem-color4 text-white btn-sm" onClick={() => dispatch('saveItemShare')}>
            Save &amp; Approve
          </button>
        </div>
      </div>
    </>
  );
};
