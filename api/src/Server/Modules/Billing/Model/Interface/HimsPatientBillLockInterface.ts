import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientBillLockAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    PatientId: number;
    LockedBy: number;
    UnLockedBy:number;
    LockedOn: Date;
    ReleasedOn: Date;
    LockStatusId: number;
    LockTypeId: number;
    Status: number;
    Comments: string;
    UnLockComments: string;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientBillLockInstance extends Instance<PatientBillLockAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientBillLockAttributes;
}
