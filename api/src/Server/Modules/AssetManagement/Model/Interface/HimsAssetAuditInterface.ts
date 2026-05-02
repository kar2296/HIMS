import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetAuditAttributes extends IAttributes {
    Id: number;
    AuditNameId: number;
    FundingName: string;
    DepartmentId: string;
    LocationId: number;
    StartDate: Date;
	FacilityId: number;
    ReconcileStartDate: Date;
    EndDate: Date;
    Notes: string;
    AuditStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetAuditInstance extends Instance<AssetAuditAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetAuditAttributes;
}
