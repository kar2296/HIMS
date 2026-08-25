import { typography } from '../components/ui/tokens';

interface DiscountItem {
  BillNumber?: string;
  BillDateTime?: string;
  BillAmount?: number | string;
  BillDiscount?: number | string;
  DiscountApprovalComments?: string;
}

interface BillingEditDiscountScreenProps {
  reactProps?: {
    item?: DiscountItem;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDate(d?: string): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()} ${time}`;
}

export function BillingEditDiscountScreen({ reactProps, onAction }: BillingEditDiscountScreenProps) {
  const item = reactProps?.item || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div className="modal-header custom-modal-header">
        <div className="col-sm-10">
          <h4 className="modal-title custom-modal-title">Bill Info</h4>
        </div>
        <div className="col-sm-2">
          <div className="filters">
            <img src="../../../../../assets/svg/close.svg" onClick={() => dispatch('cancel')} alt="" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </div>
      <div className="col-sm-12">
        <div className="drhms-refund-table">
          <table>
            <tbody>
              <tr>
                <td>
                  <span>Bill No</span>:
                </td>
                <td>{item.BillNumber}</td>
                <td>Bill Date</td>
                <td>
                  <span>{formatDate(item.BillDateTime)}</span>
                </td>
                <td>
                  <span>Bill Amount</span>:
                </td>
                <td>{item.BillAmount}</td>
                <td>
                  <span>Bill Discount</span>:
                </td>
                <td>{item.BillDiscount}</td>
                <td>
                  <span>Comments</span>:
                </td>
                <td>
                  <input
                    type="text"
                    value={item.DiscountApprovalComments || ''}
                    onChange={(e) => dispatch('commentsChange', { value: e.target.value })}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="pull-right">
          <span>
            <button type="button" className="draftbutton" onClick={() => dispatch('approve')}>Approved</button>
          </span>
          <span>
            <button type="button" className="draftbutton" onClick={() => dispatch('reject')}>Rejected</button>
          </span>
        </div>
      </div>
    </div>
  );
}
