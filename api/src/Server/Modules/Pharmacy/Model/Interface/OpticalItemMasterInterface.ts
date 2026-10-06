import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface OpticalItemMasterAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    OpticalProductTypeId: number;
    ItemCode: string;
    ItemName: string;
    Rate: number;
    GSTPercentage: number;
    HikePercentage: number;
    SalesPrice: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OpticalItemMasterInstance extends Instance<OpticalItemMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OpticalItemMasterAttributes;
}
