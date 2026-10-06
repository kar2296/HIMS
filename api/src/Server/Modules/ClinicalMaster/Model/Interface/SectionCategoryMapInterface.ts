import {IAudit} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface SectionCategoryMapAttributes extends IAudit {
    Id : number;
    SectionId: number;
    CategoryId: number;
    DisplayOrder: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface SectionCategoryMapInstance extends Instance<SectionCategoryMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SectionCategoryMapAttributes;
}
