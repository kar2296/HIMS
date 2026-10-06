import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PrivilegeCardDetailAttributes extends IAttributes {
    Id: number;
    PrivilegeCardId: number;
    PatientId: number;
    TitleId: number;
    FirstName: string;
    LastName: string;
    Age: string;
    DOB: Date;
    MobileNo: string;
    GenderId: number;
    Address: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PrivilegeCardDetailInstance extends Instance<PrivilegeCardDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PrivilegeCardDetailAttributes;
}
