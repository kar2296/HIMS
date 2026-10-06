import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TreatmentPlanDetailAttributes extends IAttributes {
	Id: number;
	TreatmentPlanId: number;
	PatientId: number;
	EncounterId: number;
	DepartmentId: number;
	DoctorId: number;
	PlanScheduleDate: Date;
	PlanStartTime: string;
	PlanEndTime: string;
	ServiceItemId: number;
	ServiceCode: string;
	ServiceName: string;
	ServiceCategoryId: number;
	ServicePrice: number;
	Quantity: number;
	NetAmount: number;
	PlanDetailStatusId: number;
	TreatmentInstructions: string;
	CompletedById: number;
	CompletedDateTime: Date;
	CancelledById: number;
	CancelledDateTime: Date;
	PatientBillDetailId: number;
	PatientBillId: number;
	PatientBillStatusId: number;
	AdditionalComments: string;
	IsPaid: boolean;
	IsFollowup: boolean;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface TreatmentPlanDetailInstance extends Instance<TreatmentPlanDetailAttributes> {
	// I'm exposing every DB column as an instance field to so that tsc won't complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: TreatmentPlanDetailAttributes;
}
