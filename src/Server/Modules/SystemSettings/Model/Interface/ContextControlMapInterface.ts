import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ContextControlMapAttributes extends IAttributes {
    ContextId: number;
    ControlId: number;
}

export interface ContextControlMapInstance extends Instance<ContextControlMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ContextControlMapAttributes;
}
