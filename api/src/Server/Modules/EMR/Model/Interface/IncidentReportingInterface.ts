import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IncidentReportingAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    IncidentReportingTime: Date;
    IncidentReportingTypeId: number;
    IncidentReportingStatusId: number;
    ReportedBy: string;
    EmpId: string;
    RootCause: string;
    CorrectiveAction: string;
    PreventiveAction: string;
    SupervisorComments: string;
    Department: string;
    IncidentDescription: string;
    InvolvedPersonName: string;
    AgeGender: string;
    UHID: string;
    IncidentDate: string;
    IncidentTime: string;
    IncidentLocation: string;
    IncidentOccurredId: number;
    OtherIncident: string;
    ClassificationIncidentId: number;
    TypeOfIncidentId: number;
    AdverseDrugId: number;
    FallId: number;
    Attachment1: string;
    Attachment2: string;
    SurgicalErrorId: number;
    OtherSurgicalError: string;
    PatientCareId: number;
    OtherPatientCare: string;
    MiscellaneousId: number;
    OtherMiscellaneous: string;
    EquipmentId: number;
    SecurityId: number;
    OtherSecurity: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    ApprovedBy: number;
    ApprovedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface IncidentReportingInstance extends Instance<IncidentReportingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IncidentReportingAttributes;
}
