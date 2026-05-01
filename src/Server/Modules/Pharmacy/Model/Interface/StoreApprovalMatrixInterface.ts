import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface StoreApprovalMatrixAttributes extends IAttributes {
    Id: number;
    StoreMasterId: number;
    FacilityId: number;
	PoTypeId: number;
    UserTypeId: number;
	UserId: number;
	PoStatusId: number;
	IsFinalApprover: boolean;
	MinPoValue: number;
	MaxPoValue: number;
	ActiveFrom: Date;
	ActiveTo: Date;
    Rev: number;
    Status: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StoreApprovalMatrixInstance extends Instance<StoreApprovalMatrixAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StoreApprovalMatrixAttributes;
}
