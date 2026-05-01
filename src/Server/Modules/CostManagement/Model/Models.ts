import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        CostDetail: SequelizeStatic.Model<i.CostDetailInstance, i.CostDetailAttributes>;
        PowerCost: SequelizeStatic.Model<i.PowerCostInstance, i.PowerCostAttributes>;
        RadiationBatches: SequelizeStatic.Model<i.RadiationBatchesInstance, i.RadiationBatchesAttributes>;
        LabourCost: SequelizeStatic.Model<i.LabourCostInstance, i.LabourCostAttributes>;
        Depreciation: SequelizeStatic.Model<i.DepreciationInstance, i.DepreciationAttributes>;
        Consumables: SequelizeStatic.Model<i.ConsumablesInstance, i.ConsumablesAttributes>;
        NotionalRent: SequelizeStatic.Model<i.NotionalRentInstance, i.NotionalRentAttributes>;
        Statistics: SequelizeStatic.Model<i.StatisticsInstance, i.StatisticsAttributes>;
     }
}
