import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LinenStockItemsInstance, i.LinenStockItemsAttributes> {
    let LinenStockItems = sequelize.define<i.LinenStockItemsInstance, i.LinenStockItemsAttributes>('LinenStockItems', {
        Id: { type: DataTypes.BIGINT, field: 'LinenStockItemId', primaryKey: true, autoIncrement: true },
        LinenItemMasterId: { type: DataTypes.BIGINT, field: 'LinenItemMasterId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrgId: { type: DataTypes.BIGINT, field: 'OrgId' },
        LinenStockItemStatusId: { type: DataTypes.BIGINT, field: 'LinenStockItemStatusId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
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
            tableName: 'linenstockitems',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (LinenStockItems as any).associate = function (models: Models) {
        LinenStockItems.belongsTo(models.Facility);
        LinenStockItems.belongsTo(models.Department);
        LinenStockItems.belongsTo(models.LinenItemMaster);
    };

    return LinenStockItems;
}
