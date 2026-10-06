import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GeneralExpensesAttributes extends IAttributes {
    Id: number;
    Name: string;
    ExpenseTypeId: number;
    FacilityId: number;
    UserId: number;
    VoucherNo: string;
    ExpenseDate: Date;
    VehicleName: string;
    DriverName: string;
    VehicleNo: string;
    Mobile: string;
    ExpenseAmount: number;
    PaymentTypeId: number;
    TerminalNoId: number;
    BankId: number;
    CardTypeId: number;
    CardNumber: string;
    CardExpiryDate: Date;
    CardHolderName: string;
    AuthorizeNumber: number;
    AuthorizedCode: string;
    ChequeNo: string;
    ChequeDate: Date;
    CollectedOn: Date;
    DDNumber: string;
    DDDate: Date;
    WireTransferId: number;
    WireTransferDate: Date;
    Remarks: string;
    ExpenseStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GeneralExpensesInstance extends Instance<GeneralExpensesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GeneralExpensesAttributes;
}
