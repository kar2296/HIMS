import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientChiefComplaintAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    ChiefComplaintId: number;
    ChiefComplaint: string;
    ChiefComplaintCategoryId: number;
    Description: string;
    StartDate: Date;
    EndDate: Date;
    Comments: string;
    PerformedDate: Date;
    PerformedBy: number;
    PatientChiefComplaintStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientChiefComplaintInstance extends Instance<PatientChiefComplaintAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientChiefComplaintAttributes;
}
