import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockAdjustmentAttributes extends IAttributes {
    Id: number;
    StockAdjustmentNumber: string;
    AdjustmentTypeId: number;
    AdjustmentStatusId: number;
    StoreMasterId: number;
    DepartmentId: number;
    LocationId: number;
    FacilityId: number;
    OrganisationId: number;
    AdjustedBy: number;
    AdjustedDate: Date;
    AdjusterComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    TotalGrossAmount: number;
    TotalNetAmount: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockAdjustmentInstance extends Instance<StockAdjustmentAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StockAdjustmentAttributes;
}
