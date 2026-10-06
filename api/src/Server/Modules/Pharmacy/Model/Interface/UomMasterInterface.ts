import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface UomMasterAttributes extends IAttributes {
    Id: number;
    UomCode: string;
    UomName: string;
    UomDescription: string;
    UomTypeId: number;
    FacilityId: number;
    IsAllFacility: boolean;
    IsActive: boolean;
    IsMultiUse: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UomMasterInstance extends Instance<UomMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UomMasterAttributes;
}
