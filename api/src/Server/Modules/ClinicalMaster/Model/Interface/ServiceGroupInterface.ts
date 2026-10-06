import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ServiceGroupAttributes extends IAttributes {
    Id: number;
    ServiceGroupCode: string;
    ServiceGroupName: string;
    OrganizationId: number;
    FacilityId: number;
    SourceTypeId: number;
    DisplayOrder: number;
    StatusId: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceGroupInstance extends Instance<ServiceGroupAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceGroupAttributes;
}
