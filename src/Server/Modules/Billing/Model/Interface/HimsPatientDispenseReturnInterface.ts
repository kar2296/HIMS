import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDispenseReturnAttributes extends IAttributes {
	Id: number;
	PatientStockReturnId: number;
	PatientReturnNumber: string;
	DispenseReturnNumber: string;
	DispenseReturnDateTime: Date;
	DispenseReturnTypeId: number;
	ReturnReceivedBy: number;
	OrganizationId: number;
	ReturnedValue: number;
	ReceivedValue: number;
	ReceivedCounterId: number;
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
	DispenseReturnStatusId: number;
	OrganisationId: number;
	FacilityId: number;
	DepartmentId: number;
	StoreMasterId: number;
	PatientId: number;
	PatientMRN: string;
	PatientName: string;
	PatientTypeId: number;
	EncounterId: number;
	EncounterTypeId: number;
	OTRegisterId: number;
	OTIdentifier: string;
	LocationId: number;
	WardId: number;
	RoomId: number;
	BedId: number;
	OTRoomId: number;
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

export interface PatientDispenseReturnInstance extends Instance<PatientDispenseReturnAttributes> {
	// Im exposing every DB column as an instance field to so that tsc wont complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: PatientDispenseReturnAttributes;
}
