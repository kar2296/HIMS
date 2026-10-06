import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TaskManagementAttributes extends IAttributes {
    Id: number;
    TaskNo: string;
    TaskDate: Date;
    TaskTypeId: number;
    TaskStatusId: number;
    PatientId: number;
    EncounterId: number;
    TaskDescription: string;
    PriorityId: number;
    AssignedFrom: number;
    AssignedFromDate: Date;
    AssignFromComments: number;
    AssignedTo: number;
    AssignedToDate: Date;
    AssignedToComments: number;
    CompletedComments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TaskManagementInstance extends Instance<TaskManagementAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TaskManagementAttributes;
}
