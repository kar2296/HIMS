import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface LinenStockItemsAttributes extends IAttributes {
    Id: number;
    LinenItemMasterId: number;
    DepartmentId: number;
    FacilityId: number;
    OrgId: number;
    LinenStockItemStatusId: number;
    Quantity: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LinenStockItemsInstance extends Instance<LinenStockItemsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LinenStockItemsAttributes;
}
