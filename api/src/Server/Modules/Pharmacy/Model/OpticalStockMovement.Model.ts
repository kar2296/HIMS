import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OpticalStockMovementInstance, i.OpticalStockMovementAttributes> {
    let OpticalStockMovement = sequelize.define<i.OpticalStockMovementInstance, i.OpticalStockMovementAttributes>('OpticalStockMovement', {
        Id: { type: DataTypes.BIGINT, field: 'OpticalStockMovementId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OpticalStockItemId: { type: DataTypes.BIGINT, field: 'OpticalStockItemId' },
        OpticalItemMasterId: { type: DataTypes.BIGINT, field: 'OpticalItemMasterId' },
        OpticalProductTypeId: { type: DataTypes.BIGINT, field: 'OpticalProductTypeId' },
        OpticalTransactionTypeId: { type: DataTypes.BIGINT, field: 'OpticalTransactionTypeId' },
        TransactionId: { type: DataTypes.BIGINT, field: 'TransactionId' },
        TransactionNumber: { type: DataTypes.STRING, field: 'TransactionNumber' },
        TransactionDate: { type: DataTypes.DATE, field: 'TransactionDate' },
        TotalBFQty: { type: DataTypes.INTEGER, field: 'TotalBFQty' },
        TransactionQty: { type: DataTypes.INTEGER, field: 'TransactionQty' },
        InQty: { type: DataTypes.INTEGER, field: 'InQty' },
        OutQty: { type: DataTypes.INTEGER, field: 'OutQty' },
        TotalAFQty: { type: DataTypes.INTEGER, field: 'TotalAFQty' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        FromStoreMasterId: { type: DataTypes.BIGINT, field: 'FromStoreMasterId' },
        ToStoreMasterId: { type: DataTypes.BIGINT, field: 'ToStoreMasterId' },
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
            tableName: 'opticalstockmovements',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (OpticalStockMovement as any).associate = function(models: Models) {
                    OpticalStockMovement.belongsTo(models.Facility);
                    OpticalStockMovement.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
                    OpticalStockMovement.belongsTo(models.ReferenceValue, { as: 'OpticalProductType', targetKey: 'ReferenceValueCodeId' });
                    OpticalStockMovement.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return OpticalStockMovement;
}
