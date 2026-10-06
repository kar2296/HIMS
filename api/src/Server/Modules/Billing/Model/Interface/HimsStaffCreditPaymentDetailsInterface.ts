import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StaffCreditPaymentDetailsAttributes extends IAttributes {
    Id: number;
    StaffCreditPaymentId: number;
    PatientBillId: number;
    StaffId: number;
    StaffName: string;
    BillNumber: string;
    BillDate: Date;
    BillAmount: number;
    ReceiptAmount: number;
    PaidAmount: number;
    BalanceAmount: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    ApprovedBy: number;
    ApprovedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface StaffCreditPaymentDetailsInstance extends Instance<StaffCreditPaymentDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StaffCreditPaymentDetailsAttributes;
}
