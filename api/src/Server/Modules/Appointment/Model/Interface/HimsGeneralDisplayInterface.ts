import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GeneralDisplayAttributes extends IAttributes {
    Id: number;
    Displaydate: Date;
    LOCATIONId: number;
    DisplayNoId: number;
    DisplayText: string;
    //DisplayStatusId: number;
    GeneralDisplayStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GeneralDisplayInstance extends Instance<GeneralDisplayAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GeneralDisplayAttributes;
}
