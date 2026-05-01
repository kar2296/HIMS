import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDoctorShareDetailsAttributes extends IAttributes {
	Id: number;
	PatientBillId: number;
	PatientBillDetailId: number;
	ParentBillId: number;
	BillDateTime: Date;
	FacilityId: number;
	TeamId:number;
	ServiceItemId: number;
	ServiceCode: string;
	ServiceName: number;
	ServiceAmount: number;
	DoctorId: number;
	DoctorName: string;
	DoctorSharePercentage: number;
	DoctorShareAmount: number;
	IsInvoicedDoctorShare: boolean;
	IsFullyPaid: boolean;
	AmountPaid: number;
	DueAmount: number;
	TdsId: number;
	TdsPercentage: number;
	TdsAmount: number;
	DoctorPaymentStatusId: number;
	PatientTypeId: number;
	EncounterId: number;
	EncounterTypeId: number;
	ShareType: number;
	DoctorShareStatusId: number;
	DoctorShareStatusIPId: number;
	IsApproved: number;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface PatientDoctorShareDetailsInstance extends Instance<PatientDoctorShareDetailsAttributes> {
	// I'm exposing every DB column as an instance field to so that tsc won't complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: PatientDoctorShareDetailsAttributes;
}
