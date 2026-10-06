import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AdverseDrugReactionAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    OrganizationId: number;
    PatientId: number;
    EncounterId: number;
    DiagnosisId: number;
    DiagnosisName: string;
    AdverseDateTime: Date;
    AdverseDrugReactionTypeId: number;
    AdverseDrugReactionStatusId: number;
    ConsultantName: string;
    DateSuspectedADR: string;
    BrandNameGeneric: string;
    DosageFrequencyOrdered: string;
    RouteofAdministration: string;
    BatchNoExpiryDate: string;
    SourceofDrugId: number;
    DetailGenericName: string;
    PreviousAllergies: string;
    TypeofReactionId: number;
    OtherReaction: string;
    LevelofReaction: string;
    OutcomeofADR: string;
    CorrectiveAction: string;
    PreventiveAction: string;
    Attachment1: string;
    Attachment2: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    ApprovedBy: number;
    ApprovedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface AdverseDrugReactionInstance extends Instance<AdverseDrugReactionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AdverseDrugReactionAttributes;
}
