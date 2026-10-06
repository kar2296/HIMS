import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IncidentManagementAttributes extends IAttributes {
    Id: number;
    IncidentNo: string;
    IncidentDate: Date;
    IncidentTypeId: number;
    IncidentStatusId: number;
    DepartmentId: number;
    PatientId: number;
    EncounterId: number;
    IncidentName: string;
    IncidentDescription: string;
    PriorityId: number;
    CreateBy: number;
    CreateDate: Date;
    CreateComments: number;
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

export interface IncidentManagementInstance extends Instance<IncidentManagementAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IncidentManagementAttributes;
}
