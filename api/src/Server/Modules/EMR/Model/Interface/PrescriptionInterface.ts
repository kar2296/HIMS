import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PrescriptionAttributes extends IAttributes {
    Id: number;
    Identifier: string;
    DoctorId: number;
    PrescriptionDate: Date;
    PatientId: number;
    DepartmentId: number;
    PrescriptionPriorityId: number;
    PharmacyId: number;
    PrecriptionStatusId: number;
    DispenseStatusId: number;
    EncounterId: number;
    ConsultationId: number;
    EncounterTypeId: number;
    AdviceInstructions: string;
    EmergencyContactNote: string;
    DiagnosisComments: string;
    SurgeryComments: string;
    IsDischargeMedication: boolean;
    FacilityId: number;
    IsCash: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    OtherDiagnosis: string;
    Physiotheraphy: string;
    PhysiotheraphyId: number;
    AdministerStatusId: number;
    IseMAR: boolean;
    ReviewDate: Date;
    AppointmentId: number;
    DiagnosisId: number;
    SurgeryDate: Date;
    SurgeryId: number;
    OtherSurgery: string;
    PhysiotheraphyDuration: string;
    PhysioFreqId: number;
}

export interface PrescriptionInstance extends Instance<PrescriptionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PrescriptionAttributes;
}
