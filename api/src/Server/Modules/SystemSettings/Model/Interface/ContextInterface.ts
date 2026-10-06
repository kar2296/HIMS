import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ContextAttributes extends IAttributes {
    Id: number;
    ParentContextId: number;
    ContextName: string;
    Display: string;
    DisplayOrder: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ContextInstance extends Instance<ContextAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ContextAttributes;
}
