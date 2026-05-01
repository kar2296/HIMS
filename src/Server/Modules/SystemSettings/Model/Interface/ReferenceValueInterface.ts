import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ReferenceValueAttributes extends IAttributes {
    Id: number;
    ReferenceValueGroupId: number;
    GroupCode: string;
    ReferenceValueCode: string;
    ReferenceValueCodeId: number;
    Description: string;
    DisplayOrder: number;
    IsDefault: boolean;
    AlternateName: string;
    LanguageId: number;
    ColorCode: string;
    ObjectTypeId: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    NumericValue: number;
	IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ReferenceValueInstance extends Instance<ReferenceValueAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ReferenceValueAttributes;
}
