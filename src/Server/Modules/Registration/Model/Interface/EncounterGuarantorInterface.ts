import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EncounterGuarantorAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    PatientId: number;
    FacilityId: number;
    Organizationid: number;
    GuarantorId: number;
    GuarantorName: string;
    GuarantorTypeId: number;
    PatientGuarantorId: number;
    GuarantorCustomerId: number;
    GuarantorLetterNo: string;
    GuarantorLetterDate: Date;
    Rank: number;
    TpaId: number;
    ServiceRateCategoryId: number;
    GuardianTypeId: number;
    EligibleAmount: number;
    IdCardNumber: string;
    PolicyNo: string;
    PolicyName: string;
    GuarantorApprovalNo: string;
    EffectiveFrom: Date;
    EffectiveTo: Date;
    SubscriberCode: string;
    SubscriberName: string;
    SubscriberRelationId: number;
    UtilizedCreditLimit: number;
    AvailableLimit: number;
    CreditLimit: number;
    CoPay: string;
    CopayValue: number;
    CreditRemarks: string;
    AuthorizedCode: string;
    BillingRuleId: number;
    Remarks: string;
    EmployeeId: string;
    EmployeeName: string;
    ActiveStatusId: number;
    IsPrimary: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EncounterGuarantorInstance extends Instance<EncounterGuarantorAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EncounterGuarantorAttributes;
}
