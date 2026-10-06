import {IAudit} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ServiceItemFacilityMapAttributes extends IAudit {
    ServiceItemId: number;
    FacilityId: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceItemFacilityMapInstance extends Instance<ServiceItemFacilityMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceItemFacilityMapAttributes;
}
