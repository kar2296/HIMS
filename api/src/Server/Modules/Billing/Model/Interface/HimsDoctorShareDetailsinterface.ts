import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DoctorShareDetailsAttributes extends IAttributes {
	Id: number;
	DoctorShareId: number;
	OrgId: number;
	FacilityId: number;
	SharingTypeId: number;
	ServiceCategoryId: number;
	ServiceId: number;
	ServiceName: number;
	EncounterTypeId: number;
	ShareTypeId: number;
	EligiblePercentage: number;
	SharePercentage: number;
	ShareAmount: number;
	MinAmount: number;
	MaxAmount: number;
	ActiveFrom: Date;
	ActiveTo: Date;
	ActiveStatusId: number;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface DoctorShareDetailsInstance extends Instance<DoctorShareDetailsAttributes> {
	// I'm exposing every DB column as an instance field to so that tsc won't complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: DoctorShareDetailsAttributes;
}
