import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockMovementInstance, i.StockMovementAttributes> {
    let StockMovement = sequelize.define<i.StockMovementInstance, i.StockMovementAttributes>('StockMovement', {
        Id: { type: DataTypes.BIGINT, field: 'StockMovementId', primaryKey: true, autoIncrement: true },
        StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        TransactionTypeId: { type: DataTypes.BIGINT, field: 'TransactionTypeId' },
        TransactionId: { type: DataTypes.BIGINT, field: 'TransactionId' },
        // TransactionDetailId: { type: DataTypes.BIGINT, field: 'TransactionDetailId' },
        TransactionNumber: { type: DataTypes.STRING, field: 'TransactionNumber' },
        TransactionReference: { type: DataTypes.STRING, field: 'TransactionReference' },
        TransactionDate: { type: DataTypes.DATE, field: 'TransactionDate' },
        TotalBFQty: { type: DataTypes.FLOAT, field: 'TotalBFQty' },
        InQty: { type: DataTypes.FLOAT, field: 'InQty' },
        OutQty: { type: DataTypes.FLOAT, field: 'OutQty' },
        TotalAFQty: { type: DataTypes.FLOAT, field: 'TotalAFQty' },
        IsMultiUse: { type: DataTypes.BOOLEAN, field: 'IsMultiUse' },
        TotalTransactions: { type: DataTypes.STRING, field: 'TotalTransactions' },
        ConsumedTransactions: { type: DataTypes.STRING, field: 'ConsumedTransactions' },
        PendingTransactions: { type: DataTypes.STRING, field: 'PendingTransactions' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        FromStoreMasterId: { type: DataTypes.BIGINT, field: 'FromStoreMasterId' },
        ToStoreMasterId: { type: DataTypes.BIGINT, field: 'ToStoreMasterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Ucp: { type: DataTypes.DECIMAL, field: 'Ucp' },
        Mrp: { type: DataTypes.DECIMAL, field: 'Mrp' },
        OrgId: { type: DataTypes.BIGINT, field: 'OrgId' },
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
            tableName: 'stockmovements',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockMovement as any).associate = function (models: Models) {
        StockMovement.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        StockMovement.belongsTo(models.StoreMaster, { as: 'StoreMaster', foreignKey: 'StoreMasterId' });
        StockMovement.belongsTo(models.StoreMaster, { as: 'ToStoreMaster', foreignKey: 'ToStoreMasterId' });
        StockMovement.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        StockMovement.belongsTo(models.PatientBills, { foreignKey: 'TransactionId' });
        StockMovement.belongsTo(models.PatientReturns, { foreignKey: 'TransactionId' });
        StockMovement.belongsTo(models.PatientDispense, { foreignKey: 'TransactionId' });
        StockMovement.belongsTo(models.PatientDispenseReturn, { foreignKey: 'TransactionId' });
        StockMovement.belongsTo(models.ReferenceValue, { as: 'TransactionType', targetKey: 'ReferenceValueCodeId' });
    };

    return StockMovement;
}
