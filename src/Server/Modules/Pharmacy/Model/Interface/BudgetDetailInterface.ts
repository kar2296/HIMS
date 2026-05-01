import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BudgetDetailAttributes extends IAttributes {
    Id: number;
    BudgetId: number;
    CategoryId: number;
    SubCategoryId: number;
    DepartmentId: number;
    ProductTypeId: number;
    CategoryName: string;
    SubCategoryName: string;
    BudgetCost: number;
    ConsumedCost: number;
    PendingCost: number;
    Remarks: number;
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

export interface BudgetDetailInstance extends Instance<BudgetDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BudgetDetailAttributes;
}
