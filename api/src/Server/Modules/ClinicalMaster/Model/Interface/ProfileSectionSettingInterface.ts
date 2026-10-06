import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ProfileSectionSettingAttributes extends IAttributes {
    Id: number;
    ProfileId: number;
    SectionId: number;
    NickName: string;
    IsMandatory: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProfileSectionSettingInstance extends Instance<ProfileSectionSettingAttributes> {
    dataValues: ProfileSectionSettingAttributes;
}
