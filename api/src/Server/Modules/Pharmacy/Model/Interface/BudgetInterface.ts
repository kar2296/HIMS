import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BudgetAttributes extends IAttributes {
    Id: number;
    DepartmentId: number;
    BudgetTrackId: number;
    CategoryId: number;
    SubCategoryId: number;
    CategoryName: string;
    SubCategoryName: string;
    Date: Date;
    DateFrom: Date;
    DateTo: Date;
    Remarks: string;
    ConsumedCost: number;
    BudgetCost: number;
    PendingCost: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    ApprovedBy: number;
    ApprovedAt: Date;
    AuthorizedBy: number;
    AuthorizedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BudgetInstance extends Instance<BudgetAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BudgetAttributes;
}
