import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface LocationMasterAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    OrganizationId: number;
    Code: string;
    LocationName: string;
    Description: string;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LocationMasterInstance extends Instance<LocationMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LocationMasterAttributes;
}
