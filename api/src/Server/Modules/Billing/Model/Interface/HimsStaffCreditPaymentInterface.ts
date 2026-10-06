import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StaffCreditPaymentAttributes extends IAttributes {
    Id: number;
    StaffCreditPaymentIdentifier: String;
    StaffCreditPaymentDate: Date;
    StaffCreditPaymentStatusId: number;
    FacilityId: number;
    StaffId: number;
    StaffName: number;
    Address: String;
    ContactNo: number;
    StaffCreditPaymentTypeId: number;
    ReceiptAmount: number;
    TotalOutstandingAmount: number;
    BankId: number;
    CardTypeId: number;
    CardNumber: string;
    CardHolderName: string;
    ChequeNo: string;
    ChequeDate: Date;
    CollectedOn: Date;
    DDNumber: string;
    DDDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    ApprovedBy: number;
    ApprovedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface StaffCreditPaymentInstance extends Instance<StaffCreditPaymentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StaffCreditPaymentAttributes;
}
