import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface WorkOrderObservationAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    WorkOrderId: number;
    WorkOrderDetailId: number;
    ObservationDate: Date;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WorkOrderObservationInstance extends Instance<WorkOrderObservationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WorkOrderObservationAttributes;
}
