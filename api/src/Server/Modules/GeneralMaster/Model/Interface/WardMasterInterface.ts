import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface WardMasterAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    OrganizationId: number;
    WardTypeId: number;
    IsTempWard: boolean;
    Code: string;
    WardName: string;
    WardMasterTypeId: number;
    Description: string;
    ServiceRateCategoryId: number;
    LocationId: number;
    BlockId: number;
    StoreMasterId: number;
    DisplayOrder: number;
    ActiveStatusId: number;
    IsActive: boolean;
    DepartmentId: number;
    GenderId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WardMasterInstance extends Instance<WardMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WardMasterAttributes;
}
