import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PriorityStatusAttributes extends IAttributes {
    Id: number;
    Menmonics: string;
    Name: string;
    DisplayName: string;
    HL7Code: string;
    Type: number;
    ActiveStaute: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PriorityStatusInstance extends Instance<PriorityStatusAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PriorityStatusAttributes;
}
