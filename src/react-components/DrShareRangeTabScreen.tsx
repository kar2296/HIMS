import React from 'react';
import { Input } from '../components/ui/Input';
import { Button } from './Button';

interface RangeRow {
  Name?: string;
  MinRange?: number | string;
  MaxRange?: number | string;
  SharePerRange?: number | string;
  Status?: number;
}

interface DrShareRangeTabScreenProps {
  reactProps?: {
    currentfilter?: {
      RangeDescription?: string;
      MinRange?: number | string;
      MaxRange?: number | string;
      SharePerRange?: number | string;
    };
    RangeDetails?: RangeRow[];
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

// React bridge migration (single mount): the Payout Range tab
// (currentcontext.SelectedOption == 3) has no native-only widgets and no
// utl.Validator.validate($scope) call, so the entry row, results table,
// and Save button are all rendered by this one <react-component> mount
// (DrShareRangeTabScreen), nested inside the still-native
// ng-if="currentcontext.SelectedOption == 3" wrapper div.
export const DrShareRangeTabScreen: React.FC<DrShareRangeTabScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const items = (reactProps?.RangeDetails || []).filter((r) => r.Status === 1);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="col-sm-12">
      <br />
      <div className="col-sm-12">
        <div className="col-sm-3">
          <label className="col-sm-5 control-label filter-lbl">Description</label>
          <div className="col-sm-7">
            <Input
              type="text"
              value={currentfilter.RangeDescription ?? ''}
              onChange={(e) => dispatch('rangeDescriptionChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="col-sm-3">
          <label className="col-sm-7 control-label">Min Range</label>
          <div className="col-sm-5">
            <Input
              type="text"
              maxLength={10}
              value={currentfilter.MinRange ?? ''}
              onChange={(e) => dispatch('minRangeChange', { value: e.target.value })}
              onKeyDown={numberWithDecimalKeyDown}
            />
          </div>
        </div>
        <div className="col-sm-3">
          <label className="col-sm-7 control-label">Max Range</label>
          <div className="col-sm-5">
            <Input
              type="text"
              maxLength={15}
              value={currentfilter.MaxRange ?? ''}
              onChange={(e) => dispatch('maxRangeChange', { value: e.target.value })}
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
              value={currentfilter.SharePerRange ?? ''}
              onChange={(e) => dispatch('sharePerRangeChange', { value: e.target.value })}
              onKeyDown={numberWithDecimalKeyDown}
            />
          </div>
        </div>
        <div className="col-sm-2">
          <Button variant="secondary" size="xs" className="pull-right btn-filter" icon="fa-plus" onClick={() => dispatch('addRange')}>
            Add
          </Button>
        </div>
      </div>

      <div className="col-sm-12">
        <table className="col-sm-12 table-bordered table">
          <thead>
            <tr>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Min Range</th>
              <th style={thStyle}>Max Range</th>
              <th style={thStyle}>Share Percentage</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{row.Name}</td>
                <td style={tdStyle}>{row.MinRange} %</td>
                <td style={tdStyle}>{row.MaxRange} %</td>
                <td style={tdStyle}>{row.SharePerRange} %</td>
                <td style={tdStyle}>
                  <button type="button" className="btn btn-primary btn-xs" tabIndex={-1} onClick={() => dispatch('editRange', { minRange: row.MinRange, maxRange: row.MaxRange })}>
                    <i className="fa fa-plus" aria-hidden="true" />
                  </button>{' '}
                  <button type="button" className="btn btn-danger btn-xs" tabIndex={-1} onClick={() => dispatch('deleteRange', { minRange: row.MinRange, maxRange: row.MaxRange })}>
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
          <button type="button" className="btn dem-color4 text-white btn-sm" onClick={() => dispatch('saveRangeShare')}>
            Save &amp; Approve
          </button>
        </div>
      </div>
    </div>
  );
};
