import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientPaymentAdjustmentsAttributes extends IAttributes {
	Id: number;
	ParentReceiptId: number;
	PatientReceiptId: number;
	AdjustedDateTime: Date;
	PaymentAdjustNumber: string;
	AvailedAdvance: number;
	AdvanceAdjusted: number;
	BalanceAdvance: number;
	RoundOffValue: number;
	PatientId: number;
	PatientName: string;
	EncounterId: number;
	EncounterTypeId: number;
	PatientBillId: number;
	BillTypeId: number;
	DepartmentId: number;
	LocationId: number;
	FacilityId: number;
	OrganizationId: number;
	AdjustedById: number;
	ApprovedById: number;
	Comments: string;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface PatientPaymentAdjustmentsInstance extends Instance<PatientPaymentAdjustmentsAttributes> {
	// I'm exposing every DB column as an instance field to so that tsc won't complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: PatientPaymentAdjustmentsAttributes;
}
