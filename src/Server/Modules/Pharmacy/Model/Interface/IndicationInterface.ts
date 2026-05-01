import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IndicationAttributes extends IAttributes {
    Id: number;
    IndicationTypeId: number;
    ShortCode: string;
    Code: string;
    Indications: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface IndicationInstance extends Instance<IndicationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IndicationAttributes;
}
