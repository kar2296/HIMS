import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DietItemMasterAttributes extends IAttributes {
    Id: number;
    DietItemCode: string;
    DietName: string;
    DietItemTypeId: number;
    DietCategoryId: number;
    DietFrequencyId: number;
    Description: string;
    IsActive: boolean;
    IsDirectBill: boolean;
    Comments: string;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DietItemMasterInstance extends Instance<DietItemMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DietItemMasterAttributes;
}
