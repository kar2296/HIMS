import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientGuarantorAttributes extends IAttributes {
	Id: number;
	EncounterId: number;
	PatientId: number;
	FacilityId: number;
	Organizationid: number;
	GuarantorId: number;
	GuarantorName: string;
	GuarantorTypeId: number;
	GuarantorLetterNo: string;
	GuarantorLetterDate: Date;
	Rank: number;
	TpaId: number;
	EligibleAmount: number;
	IdCardNumber: string;
	GuarantorCustomerId: number;
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
	ActiveStatusId: number;
	DiscountId: number;
	EmployeeId: string;
	Discount: number;
	EmployeeName: string;
	IsPrimary: boolean;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
	NooFVisitFree: number;
}
export interface PatientGuarantorInstance extends Instance<PatientGuarantorAttributes> {
	// I'm exposing every DB column as an instance field to so that tsc won't complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: PatientGuarantorAttributes;
}
