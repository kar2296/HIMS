import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface WorkOrderSampleAttributes extends IAttributes {
    Id: number;
    WorkOrderId: number;
    PatientOrderId: number;
    PatientId: number;
    Encounterid: number;
    SampleStatusId: number;
    SamplePriorityId: number;
    LabAssignTypeId: number;
    RejectionComments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WorkOrderSampleInstance extends Instance<WorkOrderSampleAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WorkOrderSampleAttributes;
}
