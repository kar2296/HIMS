import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockItemInstance, i.StockItemAttributes> {
    let StockItem = sequelize.define<i.StockItemInstance, i.StockItemAttributes>('StockItem', {
        Id: { type: DataTypes.BIGINT, field: 'StockItemId', primaryKey: true, autoIncrement: true },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        Quantity: { type: DataTypes.FLOAT, field: 'Quantity' },
        MinQuantity: { type: DataTypes.FLOAT, field: 'MinQuantity' },
        MaxQuantity: { type: DataTypes.FLOAT, field: 'MaxQuantity' },
        SafetyQuantity: { type: DataTypes.FLOAT, field: 'SafetyQuantity' },
        ReOrderQuantity: { type: DataTypes.FLOAT, field: 'ReOrderQuantity' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrgId: { type: DataTypes.BIGINT, field: 'OrgId' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        IsConsignment: { type: DataTypes.BOOLEAN, field: 'IsConsignment' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'stockitems',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (StockItem as any).associate = function(models: Models) {
                    StockItem.hasMany(models.StockSerialItem);
                    StockItem.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
                    StockItem.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
                };
 return StockItem;
}
