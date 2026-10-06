import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface NotionalRentAttributes extends IAttributes {
    Id: number;
    CostDetailId: number;
    SurfaceArea: number;
    NotionalRent: number;
	 FacilityId: number;
    TotalNotionalRent: number;
    NotionalRentProcedures: number;
    AvgProcedures: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface NotionalRentInstance extends Instance<NotionalRentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: NotionalRentAttributes;
}
