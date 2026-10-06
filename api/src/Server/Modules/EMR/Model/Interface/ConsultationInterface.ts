import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ConsultationAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    EncounterDoctorId: number;
    Name: string;
    ProfileId: number;
    IsIVF: boolean;
    ProgressNoteStatusId: number;
    VisitTypeId: number;
    ReferenceNo: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    ApprovedBy: number;
    DepartmentId: number;
    DischargeTypeId: number;
    AdmissionDate: Date;
    DischargeDate: Date;
    SurgeryDate: Date;
    UpdatedAt: Date;
    Doctor: number;
}

export interface ConsultationInstance extends Instance<ConsultationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ConsultationAttributes;
}
