import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OpticalStockItemInstance, i.OpticalStockItemAttributes> {
    let OpticalStockItem = sequelize.define<i.OpticalStockItemInstance, i.OpticalStockItemAttributes>('OpticalStockItem', {
        Id: { type: DataTypes.BIGINT, field: 'OpticalStockItemId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OpticalItemMasterId: { type: DataTypes.BIGINT, field: 'OpticalItemMasterId' },
        OpticalProductTypeId: { type: DataTypes.BIGINT, field: 'OpticalProductTypeId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        MinQuantity: { type: DataTypes.INTEGER, field: 'MinQuantity' },
        MaxQuantity: { type: DataTypes.INTEGER, field: 'MaxQuantity' },
        SafetyQuantity: { type: DataTypes.INTEGER, field: 'SafetyQuantity' },
        ReOrderQuantity: { type: DataTypes.INTEGER, field: 'ReOrderQuantity' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'opticalstockitems',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (OpticalStockItem as any).associate = function(models: Models) {
                    OpticalStockItem.belongsTo(models.Facility);
                    OpticalStockItem.belongsTo(models.OpticalItemMaster, { foreignKey: 'OpticalItemMasterId' });
                    OpticalStockItem.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
                    OpticalStockItem.belongsTo(models.ReferenceValue, { as: 'OpticalProductType', targetKey: 'ReferenceValueCodeId' });
                    OpticalStockItem.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    OpticalStockItem.belongsTo(models.UomMaster, { as: 'UomMaster', foreignKey: 'BaseUomId' });
                    OpticalStockItem.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
                    OpticalStockItem.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
                };
 return OpticalStockItem;
}
