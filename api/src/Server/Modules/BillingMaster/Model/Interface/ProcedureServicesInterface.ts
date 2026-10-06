import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ProcedureServicesAttributes extends IAttributes {
    Id: number;
    ProcedureId: number;
    ServiceItemId: number;
    ServiceName: string;
    FacilityId: number;
    Percent: number;
    IsCheifSurgeon: boolean;
    IsProcedureCharge: boolean;
    IsAssistantSurgeon: boolean;
    IsAssociateSurgeon: boolean;
    IsAnesthetist: boolean;
    IsOTHourlyCharge: boolean;
    IsActive: boolean;
    DoctorSharePercent: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProcedureServicesInstance extends Instance<ProcedureServicesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProcedureServicesAttributes;
}
