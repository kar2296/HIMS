import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ReorderLevelInstance, i.ReorderLevelAttributes> {
    let ReorderLevel = sequelize.define<i.ReorderLevelInstance, i.ReorderLevelAttributes>('ReorderLevel', {
        Id: { type: DataTypes.BIGINT, field: 'ReorderLevelId', primaryKey: true, autoIncrement: true },
        ItemMasterId: { type: DataTypes.INTEGER, field: 'ItemMasterId' },
        StoreMasterId: { type: DataTypes.INTEGER, field: 'StoreMasterId' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        ProductTypeId: { type: DataTypes.INTEGER, field: 'ProductTypeId' },
        SubProductTypeId: { type: DataTypes.INTEGER, field: 'SubProductTypeId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        FacilityName: { type: DataTypes.STRING, field: 'FacilityName' },
        MinQty: { type: DataTypes.INTEGER, field: 'MinQty' },
        MaxQty: { type: DataTypes.INTEGER, field: 'MaxQty' },
        ROLQty: { type: DataTypes.INTEGER, field: 'ROLQty' },
        LeadTime: { type: DataTypes.INTEGER, field: 'LeadTime' },
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
            tableName: 'reorderlevel',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
    return ReorderLevel;
}
