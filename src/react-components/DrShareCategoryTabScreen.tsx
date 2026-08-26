import React from 'react';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Button } from './Button';

interface LookupItem {
  Id: number;
  Text: string;
}

interface CategoryRow {
  ServiceCategoryId?: number;
  Name?: string;
  EligiblePer?: number | string;
  SharePer?: number | string;
  Status?: number;
}

interface DrShareCategoryTabScreenProps {
  reactProps?: {
    currentfilter?: {
      ServiceCategoryId?: number;
      EligiblePercentage?: number | string;
      SharePercentage?: number | string;
    };
    lookup?: { ServiceCategory?: LookupItem[] };
    CategoryItems?: CategoryRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Reproduces the original numberwithdecimal($event) ng-keypress handler
// verbatim (allows digits, a single '.', and the listed control keys).
function numberWithDecimalKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  const keyCode = e.keyCode;
  if ([8, 9, 27, 13, 110, 190].indexOf(keyCode) !== -1) return;
  if (keyCode === 65 && (e.ctrlKey || e.metaKey)) return;
  if (keyCode >= 35 && keyCode <= 40) return;
  if ((e.shiftKey || keyCode < 48 || keyCode > 57) && keyCode !== 46) {
    e.preventDefault();
  }
}

const thStyle: React.CSSProperties = { backgroundColor: '#ccc', padding: '6px 10px', textAlign: 'left' };
const tdStyle: React.CSSProperties = { color: '#000', padding: '6px 10px', border: '1px solid #ddd' };

// React bridge migration (single mount): the Category tab
// (currentcontext.SelectedOption == 1) has no native-only widgets and no
// utl.Validator.validate($scope) call, so the entry row, results table,
// and Save button are all rendered by this one <react-component> mount
// (DrShareCategoryTabScreen), nested inside the still-native
// ng-if="currentcontext.SelectedOption == 1" wrapper div.
//
// Confirmed pre-existing quirk, reproduced as-is: the label for the
// Category select reads "Billing Type" (billing.doctorshare.category.lbl)
// even though it selects a ServiceCategory -- the same mislabeled string
// is reused for this table's first column header in the original
// template; not corrected here.
export const DrShareCategoryTabScreen: React.FC<DrShareCategoryTabScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};
  const items = (reactProps?.CategoryItems || []).filter((r) => r.Status === 1);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const categoryOptions = (lookup.ServiceCategory || []).map((o) => ({ value: o.Id, label: o.Text }));

  return (
    <div className="col-sm-12">
      <br />
      <div className="col-sm-12">
        <div className="col-sm-4">
          <label className="col-sm-5 control-label filter-lbl">Billing Type</label>
          <div className="col-sm-7">
            <Select
              options={categoryOptions}
              value={currentfilter.ServiceCategoryId ?? -1}
              onChange={(v) => dispatch('serviceCategoryChange', { value: Number(v) })}
            />
          </div>
        </div>
        <div className="col-sm-3">
          <label className="col-sm-7 control-label">Eligible Percentage</label>
          <div className="col-sm-5">
            <Input
              type="text"
              maxLength={3}
              value={currentfilter.EligiblePercentage ?? ''}
              onChange={(e) => dispatch('eligiblePercentageChange', { value: e.target.value })}
              onKeyDown={numberWithDecimalKeyDown}
            />
          </div>
        </div>
        <div className="col-sm-3">
          <label className="col-sm-7 control-label">Share Percentage</label>
          <div className="col-sm-5">
            <Input
              type="text"
              maxLength={3}
              value={currentfilter.SharePercentage ?? ''}
              onChange={(e) => dispatch('sharePercentageChange', { value: e.target.value })}
              onKeyDown={numberWithDecimalKeyDown}
            />
          </div>
        </div>
        <div className="col-sm-2">
          <Button variant="secondary" size="xs" className="pull-right btn-filter" icon="fa-plus" onClick={() => dispatch('addCategory')}>
            Add
          </Button>
        </div>
      </div>

      <div className="col-sm-12">
        <table className="col-sm-12 table-bordered table">
          <thead>
            <tr>
              <th style={thStyle}>Billing Type</th>
              <th style={thStyle}>Eligible Percentage</th>
              <th style={thStyle}>Share Percentage</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{row.Name}</td>
                <td style={tdStyle}>{row.EligiblePer} %</td>
                <td style={tdStyle}>{row.SharePer} %</td>
                <td style={tdStyle}>
                  <button type="button" className="btn btn-primary btn-xs" tabIndex={-1} onClick={() => dispatch('editCategory', { serviceCategoryId: row.ServiceCategoryId })}>
                    <i className="fa fa-plus" aria-hidden="true" />
                  </button>{' '}
                  <button type="button" className="btn btn-danger btn-xs" tabIndex={-1} onClick={() => dispatch('deleteCategory', { serviceCategoryId: row.ServiceCategoryId })}>
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
          <button type="button" className="btn dem-color4 text-white btn-sm" onClick={() => dispatch('saveCategoryShare')}>
            Save &amp; Approve
          </button>
        </div>
      </div>
    </div>
  );
};
