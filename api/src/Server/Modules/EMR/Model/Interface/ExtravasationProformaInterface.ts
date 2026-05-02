import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ExtravasationProformaAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    PatientId: number;
    EncounterId: number;
    ExtravasationDateTime: Date;
    ExtravasationProformaTypeId: number;
    ExtravasationProformaStatusId: number;
    MethodOfDrug: string;
    IVsiteLocation: string;
    EstimateAmount: string;
    NeedleType: string;
    IVsiteAppearance: string;
    InchargeDoctor: string;
    DoctorNotes: string;
    InchargeNurse: string;
    PatientComplaints: string;
    StopDrug: string;
    ExtravasatedArea: string;
    AspirateResidual: string;
    AmountAspiratedMls: string;
    Antidote: string;
    ColdCompresses: string;
    WarmCompresses: string;
    Elevateextremity: string;
    Baselinephoto: string;
    Dressingapplied: string;
    TypeofAntibiotic: string;
    DurationofAntibiotic: string;
    HealingOfWound: string;
    IsAntibiotics: boolean;
    IsSurgicalIntervention: boolean;
    IsDelayTreatment: boolean;
    IsMovements: boolean;
    PhotoAfterextravasation: string;
    PhotoAfterHealing: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    ApprovedBy: number;
    ApprovedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface ExtravasationProformaInstance extends Instance<ExtravasationProformaAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ExtravasationProformaAttributes;
}
