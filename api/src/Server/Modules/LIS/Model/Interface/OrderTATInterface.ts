import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface OrderTATAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    PatientOrderId: number;
    WorkOrderId: number;
    PatientOrderDetailId: number;
    DoctorId: number;
    TestId: number;
    TestName: string;
    OrderedOn: Date;
    AcceptedOn: Date;
    SampleCollectedOn: Date;
    SampleReceivedOn: Date;
    AssignedOn: Date;
    TechValidationOn: Date;
    MedValidationOn: Date;
    ReleasedOn: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OrderTATInstance extends Instance<OrderTATAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OrderTATAttributes;
}
