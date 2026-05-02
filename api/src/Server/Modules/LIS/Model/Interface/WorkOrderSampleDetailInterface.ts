import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface WorkOrderSampleDetailAttributes extends IAttributes {
    Id: number;
    WorkOrderSampleId: number;
    OrderDetailId : number;
    SampleIdentifier: string;
    TestId: number;
    TestName: string;
    SamplePriorityId: number;
    SampleDetailStatusId: number;
    CollectedDate: Date;
    ReviewDate: Date;
    SampleTypeId: number;
    SampleType: string;
    PatientWorkOrderId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    IsSeparateSampleId: number;
}

export interface WorkOrderSampleDetailInstance extends Instance<WorkOrderSampleDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WorkOrderSampleDetailAttributes;
}
