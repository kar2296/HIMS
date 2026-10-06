import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ReferenceValueGroupAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    ScreenId: number;
    GroupCode: string;
    GroupName: string;
    Description: string;
    IsSystem: boolean;
    ActiveFrom: Date;
    ActiveTo: Date;
    IsSortByDescription: boolean;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ReferenceValueGroupInstance extends Instance<ReferenceValueGroupAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ReferenceValueGroupAttributes;
}
