import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LinenStockTransferDetailInstance, i.LinenStockTransferDetailAttributes> {
    let LinenStockTransferDetail = sequelize.define<i.LinenStockTransferDetailInstance,
        i.LinenStockTransferDetailAttributes>('LinenStockTransferDetail', {
            Id: { type: DataTypes.BIGINT, field: 'LinenStockTransferDetailId', primaryKey: true, autoIncrement: true },
            LinenStockTransferId: { type: DataTypes.BIGINT, field: 'LinenStockTransferId' },
            LinenStockRequestDetailId: { type: DataTypes.BIGINT, field: 'LinenStockRequestDetailId' },
            LinenItemMasterId: { type: DataTypes.BIGINT, field: 'LinenItemMasterId' },
            LinenItemName: { type: DataTypes.STRING, field: 'LinenItemName' },
            LinenItemCode: { type: DataTypes.STRING, field: 'LinenItemCode' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            RequestedQuantity: { type: DataTypes.INTEGER, field: 'RequestedQuantity' },
            IssuedQuantity: { type: DataTypes.INTEGER, field: 'IssuedQuantity' },
            PendingQuantity: { type: DataTypes.STRING, field: 'PendingQuantity' },
            ReceivedQuantity: { type: DataTypes.STRING, field: 'ReceivedQuantity' },
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
                tableName: 'linenstocktransferdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (LinenStockTransferDetail as any).associate = function (models: Models) {
        LinenStockTransferDetail.hasMany(models.LinenStockTransfer, { foreignKey: 'LinenStockTransferId' });
    };
    return LinenStockTransferDetail;
}
