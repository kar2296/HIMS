import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AllergyMasterAttributes extends IAttributes {
    Id: number;
    DisplayId: string;
    AllergyName: string;
    AllergyTypeId: number;
    AllergyEventTypeId: number;
    GenericId: number;
    DietItemId: number;
    ReferrenceLink: string;
    GenericName: string;
    GenericCode: string;
    DietName: string;
    DietCode: string;
    Description: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AllergyMasterInstance extends Instance<AllergyMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AllergyMasterAttributes;
}
