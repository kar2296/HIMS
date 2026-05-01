import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetMaintananceAttributes extends IAttributes {
    Id: number;
    EventDate: Date;
    EventDescription: string;
    MaintananceDate: Date;
    PerformedBy: string;
    AssetId: number;
    Cost: number;
	 FacilityId: number;
    MaintananceDescription: string;
    TotalMaintananceId: number;
    CompleteId: number;
    PendingId: number;
    NextSchedule: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetMaintananceInstance extends Instance<AssetMaintananceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetMaintananceAttributes;
}
