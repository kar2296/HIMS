import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface UserDefinedFieldAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    ScreenId: number;
    DisplayOrder: number;
    FieldNameId: number;
    LabelNameChange: string;
    InputTypeId: number;
    MinCharLength: number;
    MaxCharLength: number;
    IsMandatory: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UserDefinedFieldInstance extends Instance<UserDefinedFieldAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UserDefinedFieldAttributes;
}
