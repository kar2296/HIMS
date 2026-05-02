import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface UserBillingCountersAttributes extends IAttributes {
	Id: number;
	UserId: number;
	BillingCounterId: number;
	DepartmentId: number;
	StoreMasterId: number;
	FacilityId: number;
	DocumentNumber: string;
	DocumentDate: Date;
	OpeningDate: Date;
	OpenedBy: number;
	OpeningBalance: number;
	OpeningCash: number;
	OpeningCard: number;
	OpeningCheque: number;
	OpeningRemarks: string;
	ClosingDate: Date;
	ClosedBy: number;
	ClosingBalance: number;
	ClosingCash: number;
	ClosingCard: number;
	ClosingCheque: number;
	ClosingRemarks: string;
	BillingCounterStatusId: number;
	SubmitedDate: Date;
	SubmitedBy: number;
	ApprovedDate: Date;
	ApprovedBy: number;
	AuthorizedDate: Date;
	AuthorizedBy: number;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface UserBillingCountersInstance extends Instance<UserBillingCountersAttributes> {
	// I'm exposing every DB column as an instance field to so that tsc won't complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: UserBillingCountersAttributes;
}
