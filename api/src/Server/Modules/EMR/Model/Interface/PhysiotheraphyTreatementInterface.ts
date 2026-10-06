import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PhysiotheraphyTreatementAttributes extends IAttributes {
    Id: number;
    PhysiotheraphyDate: Date;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    TreatementModalityId: number;
    ClinicNotes: string;
    ModalityName: string;
    PhysiotherapistName: string;
    StartTime: string;
    EndTime: string;
    Duration: number;
    BP: string;
    RBSFBS: string;
    Signature: string;
    PhysiotheraphyStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PhysiotheraphyTreatementInstance extends Instance<PhysiotheraphyTreatementAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PhysiotheraphyTreatementAttributes;
}
