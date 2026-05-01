import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ProfileMasterAttributes extends IAttributes {
    Id: number;
    Name: string;
    Description: string;
    IsActive: boolean;
    IsIVF: boolean;
    ActiveStatusId: number;
    PrintConfig: string;
    ProfilemasterTypeId: string;
    FacilityId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProfileMasterInstance extends Instance<ProfileMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProfileMasterAttributes;
}
