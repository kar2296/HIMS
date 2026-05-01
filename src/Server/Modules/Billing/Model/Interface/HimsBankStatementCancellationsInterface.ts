import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BankStatementCancellationsAttributes extends IAttributes {
    Id: number;
    BankStatementId: number;
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

export interface BankStatementCancellationsInstance extends Instance<BankStatementCancellationsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BankStatementCancellationsAttributes;
}
