import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientNotifiableDiseaseAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    NotifiableDiseaseTypeId: number;
    NotifiableDiseaseId: number;
    NotifiableDiseaseName: string;
    Notes: string;
    PerformedDate: Date;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientNotifiableDiseaseInstance extends Instance<PatientNotifiableDiseaseAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientNotifiableDiseaseAttributes;
}
