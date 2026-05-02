import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OrgIsolationAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    Code: string;
    OrgIsolationName: string;
    Mnemonic: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OrgIsolationInstance extends Instance<OrgIsolationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OrgIsolationAttributes;
}
