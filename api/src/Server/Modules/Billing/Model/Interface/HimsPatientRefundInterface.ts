import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientRefundAttributes extends IAttributes {
    Id: number;
    RefundDateTime: Date;
    RefundIdentifier: string;
    FacilityId: number;
    OrganizationId: number;
    PatientId: number;
    RefundTypeId: number;
    EncounterId: number;
    EncounterTypeId: number;
    PatientName: string;
    PatientReceiptId: number;
    RefundAmount: number;
    DepartmentID: number;
    StoreMasterId: number;
    PaymentcounterID: number;
    GuarantorId: number;
    GuarantorTypeId: number;
    RefundGeneratedById: number;
    RefundApprovedById: number;
    RefundApprovalStatusId: number;
    DoctorId: number;
    PatientBillId: number;
    PharmacyReturnId: number;
    CardNumber: number;
    CardDateTime: Date;
    CardExpiryDate: Date;
    BankId: number;
    CardTypeId: number;
    TerminalNoId: number;
    CardHolderName: string;
    AuthorizeNumber: number;
    GurantorName: string;
    ChequeNo: number;
    ChequeDate: Date;
    DDNumber: number;
    DDDate: Date;
    WireTransferId: number;
    WireTransferDate: Date;
    Comments: string;
    IsCashToCredit: boolean;
    CancelReason: string;
    RefundStatusId: number;
    RoundOffValue: number;
    PatientReturnId: number;
    DebitNoteId: number;
    PaymentTypeId: number;
    PatientCreditNoteId: number;
	 RemarkId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientRefundInstance extends Instance<PatientRefundAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientRefundAttributes;
}
