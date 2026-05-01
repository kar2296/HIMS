import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CarePathSectionAttributes extends IAttributes {
    Id: number;
    CarePathId: number;
    SectionId: number;
    SectionTypeId: number;
    IsManditory: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CarePathSectionInstance extends Instance<CarePathSectionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CarePathSectionAttributes;
}
