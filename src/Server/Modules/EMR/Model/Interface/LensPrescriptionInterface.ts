import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LensPrescriptionAttributes extends IAttributes {
    Id: number;
    LensIdentifier: string;
    LensPrescriptionDate: Date;
    PrescriptionId: number;
    ConsultationId: number;
    FacilityId: number;
    PatientId: number;
    EncounterId: number;
    DoctorId: number;
    DepartmentId: number;
    LeftDistanceSph: string;
    LeftReadingSph: string;
    LeftDistanceCyl: string;
    LeftReadingCyl: string;
    LeftDistanceAxis: string;
    LeftReadingAxis: string;
    LeftDistancePrism: string;
    LeftReadingPrism: string;
    LeftDistanceBase: string;
    LeftReadingBase: string;
    LeftAdd: string;
    LeftDec: string;
    RightDistanceSph: string;
    RightReadingSph: string;
    RightDistanceCyl: string;
    RightReadingCyl: string;
    RightDistanceAxis: string;
    RightReadingAxis: string;
    RightDistancePrism: string;
    RightReadingPrism: string;
    RightDistanceBase: string;
    RightReadingBase: string;
    RightAdd: string;
    RightDec: string;
    LensForm: string;
    LensTint: string;
    TypeOfLens: string;
    SegDetails: string;
    LensSize: string;
    LensShape: string;
    DistanceCentres: string;
    NearCentres: string;
    Instructions: string;
    LensPrescriptionStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LensPrescriptionInstance extends Instance<LensPrescriptionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LensPrescriptionAttributes;
}
