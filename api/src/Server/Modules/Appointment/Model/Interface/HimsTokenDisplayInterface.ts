import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TokenDisplayAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    PatientId: number;
    EncounterId: number;
    DepartmentId: number;
    TokenNo: string;
    RoomNo: string;
    TokenStatusId: number;
    PatientOrderId:number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TokenDisplayInstance extends Instance<TokenDisplayAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TokenDisplayAttributes;
}
