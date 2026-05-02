import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientEstimationAttributes extends IAttributes {
    Id: number;
    EstimationDate: Date;
    BedTypeId: number;
    GuarantorId: number;
    DoctorId: number;
    FacilityId: number;
    PatientId: number;
    ContactDetails: string;
    Remarks: string;
    SaveTypeId: number;
    EstimationInclusion: string;
    EstimationExclusion: string;
    AttendersName: string;
    RelationshipId: number;
    Treatment: string;
    PatientName: string;
    DoctorName: string;
    Age: number;
    GenderId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientEstimationInstance extends Instance<PatientEstimationAttributes> {
    dataValues: PatientEstimationAttributes;
}
