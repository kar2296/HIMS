import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ConsumablesInstance, i.ConsumablesAttributes> {
    let Consumables = sequelize.define<i.ConsumablesInstance, i.ConsumablesAttributes>('Consumables', {
        Id: { type: DataTypes.BIGINT, field: 'ConsumableId', primaryKey: true, autoIncrement: true },
        CostDetailId: { type: DataTypes.BIGINT, field: 'CostDetailId' },
        ItemId: { type: DataTypes.BIGINT, field: 'ItemId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        TypeId: { type: DataTypes.BIGINT, field: 'TypeId' },
		FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        Quantity: { type: DataTypes.BIGINT, field: 'Quantity' },
        CostTypeId: { type: DataTypes.BIGINT, field: 'CostTypeId' },
        UCP: { type: DataTypes.DECIMAL, field: 'UCP' },
        Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
        TransactionId: { type: DataTypes.BIGINT, field: 'TransactionId' },
        TransactionTypeId: { type: DataTypes.BIGINT, field: 'TransactionTypeId' },
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
            tableName: 'consumables',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Consumables as any).associate = function(models: Models) {
                    Consumables.belongsTo(models.ItemMaster, { foreignKey: 'ItemId' });
                    Consumables.belongsTo(models.ReferenceValue, { as: 'CostType', targetKey: 'ReferenceValueCodeId' });
                };
 return Consumables;
}
