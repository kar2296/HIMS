import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientDeathAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    PatientId: number;
    EncounterId: number;
    DoctorId: number;
    DeathTypeId: number;
    DeathPlaceId: number;
    DeathStatusId: number;
    IsDeathConfirmed: boolean;
    DeathRequestedBy: number;
    DeathRequestedDate: Date;
    DeathDate: Date;
    DeathApprovedDate: Date;
    DeathApprovedBy: number;
    DeathComments: string;
    DeathReversedDate: Date;
    DeathReversedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDeathInstance extends Instance<PatientDeathAttributes> {
    dataValues: PatientDeathAttributes;
}
