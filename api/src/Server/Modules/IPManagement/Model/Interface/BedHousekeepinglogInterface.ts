import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BedHousekeepinglogAttributes extends IAttributes {
    Id: number;
    HousekeepingId: number;
    VisitIdentifier: number;
    HousekeepingStatusId: number;
	Comments: string;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BedHousekeepinglogInstance extends Instance<BedHousekeepinglogAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BedHousekeepinglogAttributes;
}
