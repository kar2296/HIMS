import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PowerCostInstance, i.PowerCostAttributes> {
    let PowerCost = sequelize.define<i.PowerCostInstance, i.PowerCostAttributes>('PowerCost', {
        Id: { type: DataTypes.BIGINT, field: 'PowerCostId', primaryKey: true, autoIncrement: true },
        CostDetailId: { type: DataTypes.INTEGER, field: 'CostDetailId' },
        EquipmentId: { type: DataTypes.INTEGER, field: 'EquipmentId' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        WattageId: { type: DataTypes.INTEGER, field: 'WattageId' },
		FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        PowerCost: { type: DataTypes.DECIMAL, field: 'PowerCost' },
        BatteryBackupId: { type: DataTypes.INTEGER, field: 'BatteryBackupId' },
        PowerPhaseId: { type: DataTypes.INTEGER, field: 'PowerPhaseId' },
        KWHunit: { type: DataTypes.INTEGER, field: 'KWHunit' },
        KWHCost: { type: DataTypes.DECIMAL, field: 'KWHCost' },
        Cost: { type: DataTypes.DECIMAL, field: 'Cost' },
        AvgProcedure: { type: DataTypes.DECIMAL, field: 'AvgProcedure' },
        AvgPowerCost: { type: DataTypes.DECIMAL, field: 'AvgPowerCost' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'powercost',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PowerCost as any).associate = function(models: Models) {
                    PowerCost.belongsTo(models.ReferenceValue, { as: 'Wattage', targetKey: 'ReferenceValueCodeId' });
                    PowerCost.belongsTo(models.ReferenceValue, { as: 'BatteryBackup', targetKey: 'ReferenceValueCodeId' });
                    PowerCost.belongsTo(models.ReferenceValue, { as: 'PowerPhase', targetKey: 'ReferenceValueCodeId' });

                };
 return PowerCost;
}
