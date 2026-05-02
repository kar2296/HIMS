import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDispenseAttributes extends IAttributes {
	Id: number;
	PatientStockRequestId: number;
	PatientRequestNumber: string;
	DispenseNumber: string;
	DispenseDateTime: Date;
	DispensedBy: number;
	DispenseTypeId: number;
	DispensePriorityId: number;
	DispensedValue: number;
	DispensedCounterId: number;
	TotalGrossAmount: number;
	DiscountModeId: number;
	DiscountValue: number;
	DiscountAmount: number;
	TotalGstAmount: number;
	TotalInGstAmount: number;
	TotalCGstAmount: number;
	TotalSGstAmount: number;
	TotalNetAmountBeforeGst: number;
	TotalNetAmount: number;
	ApprovedBy: number;
	ApprovedDateTime: Date;
	DispenseStatusId: number;
	OrganisationId: number;
	FacilityId: number;
	DepartmentId: number;
	StoreMasterId: number;
	PatientId: number;
	PatientMRN: string;
	PatientName: string;
	PatientTypeId: number;
	OTIdentifier: string;
	EncounterId: number;
	EncounterTypeId: number;
	OTRegisterId: number;
	LocationId: number;
	WardId: number;
	RoomId: number;
	BedId: number;
	OTRoomId: number;
	ProcedureId: number;
	GuarantorId: number;
	GuarantorTypeId: number;
	DoctorId: number;
	DoctorName: string;
	ReferralId: number;
	ReferralName: string;
	RemarkId: number;
	Comments: string;
	NetPatientAmount: number;
    NetInsuranceAmount: number;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface PatientDispenseInstance extends Instance<PatientDispenseAttributes> {
	// Im exposing every DB column as an instance field to so that tsc wont complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: PatientDispenseAttributes;
}
