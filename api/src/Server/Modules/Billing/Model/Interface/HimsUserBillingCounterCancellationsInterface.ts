import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface UserBillingCounterCancellationsAttributes extends IAttributes {
    Id: number;
    UserBillingCounterId: number;
    PatientBillId: number;
    BillNumber: string;
    PatientReceiptId: number;
    ReceiptNumber: string;
    CancelledAmount: number;
    CancelledReason: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UserBillingCounterCancellationsInstance extends Instance<UserBillingCounterCancellationsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UserBillingCounterCancellationsAttributes;
}
