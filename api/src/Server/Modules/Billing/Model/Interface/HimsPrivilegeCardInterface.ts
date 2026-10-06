import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PrivilegeCardAttributes extends IAttributes {
    Id: number;
    PromotionalSchemeId: number;
    PromotionSchemeCode: string;
    PromotionSchemeName: string;
    CardTypeId: number;
    CardName: string;
    CardNo: string;
    ValidTo: Date;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PrivilegeCardInstance extends Instance<PrivilegeCardAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PrivilegeCardAttributes;
}
