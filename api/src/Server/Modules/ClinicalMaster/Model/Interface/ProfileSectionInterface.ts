import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ProfileSectionAttributes extends IAttributes {
    Id: number;
    ProfileId: number;
    SectionId: number;
    DockPositionId: number;
    DisplayOrder: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProfileSectionInstance extends Instance<ProfileSectionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProfileSectionAttributes;
}
