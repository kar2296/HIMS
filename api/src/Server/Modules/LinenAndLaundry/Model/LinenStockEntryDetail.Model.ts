import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LinenStockEntryDetailInstance, i.LinenStockEntryDetailAttributes> {
    let LinenStockEntryDetail = sequelize.define
        <i.LinenStockEntryDetailInstance, i.LinenStockEntryDetailAttributes>('LinenStockEntryDetail', {
            Id: { type: DataTypes.BIGINT, field: 'LinenStockEntryDetailId', primaryKey: true, autoIncrement: true },
            LinenStockEntryId: { type: DataTypes.BIGINT, field: 'LinenStockEntryId' },
            LinenItemMasterId: { type: DataTypes.BIGINT, field: 'LinenItemMasterId' },
            LinenItemCode: { type: DataTypes.STRING, field: 'LinenItemCode' },
            LinenItemName: { type: DataTypes.STRING, field: 'LinenItemName' },
            LinenType: { type: DataTypes.STRING, field: 'LinenType' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            Price: { type: DataTypes.DECIMAL, field: 'Price' },
            Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
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
                tableName: 'linenstockentrydetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (LinenStockEntryDetail as any).associate = function (models: Models) {
        LinenStockEntryDetail.belongsTo(models.LinenStockEntry, { as: 'LinenStockEntry', foreignKey: 'LinenStockEntryId' });
        LinenStockEntryDetail.belongsTo(models.LinenItemMaster, { as: 'LinenItemMaster', foreignKey: 'LinenItemMasterId' });
    };

    return LinenStockEntryDetail;
}


