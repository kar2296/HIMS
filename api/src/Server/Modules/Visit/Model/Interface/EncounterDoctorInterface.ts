import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EncounterDoctorAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    EncounterConsulationId: number;
    AppointmentId: number;
    VisitIdentifier: string;
    ConsultationNumber: string;
    DoctorId: number;
    DoctorName: string;
    DepartmentId: number;
    SpecialityId: number;
    FacilityId: number;
    OrganizationId: number;
    StartDate: Date;
    EndDate: Date;
    TokenNumber: string;
    ReferralId: number;
    TransferedById: number;
    ClinicalStaffId: number;
    AdmitReason: string;
    IsPrimary: boolean;
    IsVirtualConsultation: boolean;
    EncounterDoctorStatus: number;
    VirtualCategoryId: number;
    VirtualOrderId: number;
    IsEmergencyVisit: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EncounterDoctorInstance extends Instance<EncounterDoctorAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EncounterDoctorAttributes;
}
