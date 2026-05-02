import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientAlertAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    AlertTypeId: number;
    SeverityId: number;
    PriorityId: number;
    DepartmentId: number;
    OnsetDate: Date;
    ClosureDate: Date;
    AlertDescription: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientAlertInstance extends Instance<PatientAlertAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientAlertAttributes;
}
