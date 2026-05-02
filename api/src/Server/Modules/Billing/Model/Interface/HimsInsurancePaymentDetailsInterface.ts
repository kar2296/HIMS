import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface InsurancePaymentDetailsAttributes extends IAttributes {
    Id: number;
    InsurancePaymentId: number;
    PatientBillId: number;
    PatientId: number;
    PatientName: string;
    BillDateTime: Date;
    BillIdentifier: string;
    VisitIdentifier: string;
    ToBeClaimAmount: number;
    ReceivedAmount: number;
    TDSAmount: number;
    Disallowed: number;
    AgreementDiscountAmt: number;
    Comments: string;
    Remarks: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface InsurancePaymentDetailsInstance extends Instance<InsurancePaymentDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: InsurancePaymentDetailsAttributes;
}
