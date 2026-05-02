import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BloodRequestAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    DoctorId: number;
    BloodRequestNo: string;
    IsWhiteBlood: boolean;
    WhiteBloodComments: string;
    IsPackedCell: boolean;
    PackedCellComments: string;
    IsPlatelet: boolean;
    PlateletComments: string;
    IsFFP: boolean;
    FFPComments: string;
    IsOthers: boolean;
    OthersComments: string;
    BloodPriorityId: number;
    RequestedVolume: string;
    BloodRequestDate: Date;
    BloodBankName: string;
    RequirementRemarks: string;
    BloodBankStatusId: number;
    UnitNo: string;
    TransfusionNo: string;
    PatientNo: string;
    AntibodyScreenId: number;
    CrossMatchId: number;
    DonorABOId: number;
    DonorRhId: number;
    ReceipientABOId: number;
    ReceipientRhId: number;
    IsRecord: boolean;
    IsNoRecord: boolean;
    PerformedBy: number;
    VerifiedBy: number;
    TransfusionRemarks: string;
    TransfusionDate: Date;
    Donor1BloodGroupId: number;
    Donor1BlNo: string;
    Donor2BloodGroupId: number;
    Donor2BlNo: string;
    Donor3BloodGroupId: number;
    Donor3BlNo: string;
    Donor4BloodGroupId: number;
    Donor4BlNo: string;
    Donor5BloodGroupId: number;
    Donor5BlNo: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BloodRequestInstance extends Instance<BloodRequestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BloodRequestAttributes;
}
