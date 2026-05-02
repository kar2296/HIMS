import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DoctorShareAttributes extends IAttributes {
    Id: number;
    OrgId: number;
    FacilityId: number;
    DoctorClassId: number;
    ShareTypeId: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    EncounterTypeId: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DoctorShareInstance extends Instance<DoctorShareAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DoctorShareAttributes;
}
