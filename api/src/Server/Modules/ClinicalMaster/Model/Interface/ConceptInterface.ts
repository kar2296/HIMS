import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ConceptAttributes extends IAttributes {
    Id: number;
    CategoryId: number;
    ConceptName: string;
    ConceptIdentifier : string;
    ValueTypeId: number;
    IsMultiple: boolean;
    IsMandatory: boolean;
    Description: string;
    DisplayOrder: number;
    Attributes: string;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ConceptInstance extends Instance<ConceptAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ConceptAttributes;
}
