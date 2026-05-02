import {IAudit} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FacilityDepartmentMapAttributes extends IAudit {
    FacilityId: number;
    DepartmentId: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FacilityDepartmentMapInstance extends Instance<FacilityDepartmentMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FacilityDepartmentMapAttributes;
}
