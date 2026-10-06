import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PowerCostAttributes extends IAttributes {
    Id: number;
    CostDetailId: string;
    EquipmentId: number;
    AssetId: number;
    WattageId: number;
	 FacilityId: number;
     PowerCost: number;
    AssetName: string;
    BatteryBackupId: number;
    PowerPhaseId: number;
    KWHunit: number;
    KWHCost: number;
    Cost: number;
    AvgProcedure: string;
    AvgPowerCost: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PowerCostInstance extends Instance<PowerCostAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PowerCostAttributes;
}
