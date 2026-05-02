import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientCertificateAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    PatientName: string;
    PatientMrn: string;
    Mobile: string;
    EncounterId: number;
    WardId: number;
    RoomId: number;
    BedId: number;
    GuarantorId: number;
    AdmissionDate: Date;
    DischargeDate: Date;
    DoctorId: number;
    DepartmentId: number;
    DoctorName: string;
    DataTemplate: string;
    SurgeryDate: Date;
    TemplateTypeId: number;
    NoteTypeId: number;
    VisitIdentifier: string;
    NoteTemplateId: number;
    DischargeTypeId: number;
    CertificateStatusId: number;
    AdmissionStatusId: number;
    FacilityId: number;
    ReleasedToPatient: number;
    ReleasedOn: Date;
    ReleasedBy: number;
    ApprovedOn: Date;
    AprovedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientCertificateInstance extends Instance<PatientCertificateAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientCertificateAttributes;
}
