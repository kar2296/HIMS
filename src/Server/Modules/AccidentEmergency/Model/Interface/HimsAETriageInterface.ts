import type { IAttributes } from '../../../Base/Index';
import type { Instance } from '../../../../Core/Index';

export interface AETriageAttributes extends IAttributes {
    Id: number;
    TriageLevelId: number;
    EncounterId: number;
    AERegistraionId: number;
    PatientId: number;
    IsResuscitate: number;
    IsEquipmentGreaterThan2: number;
    IsEquipmentGreaterThan1: number;
    IsOtherServices: number;
    IsRequiredAdmission: number;
    IsRequiredSurgery: number;
    Comments: string;
    ComaScaleE: number;
    ComaScaleV: number;
    ComaScaleM: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AETriageInstance extends Instance<AETriageAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AETriageAttributes;
}
