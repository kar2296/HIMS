import type { IAttributes } from '../../../Base/Index';
import type { Instance } from '../../../../Core/Index';

export interface AERegistrationAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    ERTypeId: number;
    ArrivalModeId: number;
    EscortedById: number;
    EscortTypeId: number;
    FacilityId: number;
    DoctorId: number;
    DepartmentId: number;
    EmergencyDate: Date;
    EmergencyConditionId: number;
    GuarantorId: number;
    WardId: number;
    RoomId: number;
    BedId: number;
    IsBroughtDead: boolean;
    IsMRDRequest: boolean;
    InjuryReason: string;
    ExaminationDetails: string;
    IncidentAddress: string;
    Address1: string;
    Address2: string;
    PinCodeId: number;
    CountryId: number;
    StateId: number;
    CityId: number;
    Area: string;
    DiagnosisId: number;
    TriageLevelId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AERegistrationInstance extends Instance<AERegistrationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AERegistrationAttributes;
}
