import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientEstimationDetailsAttributes extends IAttributes {
    Id: number;
    PatientEstimationId: number;
    BedTypeId: number;
    Days: number;
    EstimationAmount: number;
    Remarks: string;
    Rate: number;
    ServiceGroupId:number;
    ServiceGroup: string;
    BedTypes: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientEstimationDetailsInstance extends Instance<PatientEstimationDetailsAttributes> {
    dataValues: PatientEstimationDetailsAttributes;
}


