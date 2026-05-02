import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface CronStatusAttributes extends IAttributes {
    Id: number;
    CronDescription: string;
    CompletedStatusId: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CronStatusInstance extends Instance<CronStatusAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CronStatusAttributes;
}
