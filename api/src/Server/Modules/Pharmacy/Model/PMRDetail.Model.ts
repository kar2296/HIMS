import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PMRDetailInstance, i.PMRDetailAttributes> {
    let PMRDetail = sequelize.define<i.PMRDetailInstance,
        i.PMRDetailAttributes>('PMRDetail', {
            Id: { type: DataTypes.BIGINT, field: 'PMRDetailId', primaryKey: true, autoIncrement: true },
            PMRId: { type: DataTypes.BIGINT, field: 'PMRId' },
            ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
            ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
            CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
            SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
            ProductTypeId: { type: DataTypes.STRING, field: 'ProductTypeId' },
            SubProductTypeId: { type: DataTypes.BIGINT, field: 'SubProductTypeId' },
            Quantity: { type: DataTypes.STRING, field: 'Quantity' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
                tableName: 'pmrdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PMRDetail as any).associate = function (models: Models) {
        PMRDetail.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        PMRDetail.belongsTo(models.ItemCategory, { foreignKey: 'CategoryId' });
        PMRDetail.belongsTo(models.ItemSubCategory, { foreignKey: 'SubCategoryId' });
        PMRDetail.belongsTo(models.ProductType, { foreignKey: 'ProductTypeId' });
        PMRDetail.belongsTo(models.ProductSubType, { foreignKey: 'SubProductTypeId' });
        PMRDetail.hasMany(models.PMR, { foreignKey: 'PMRId' });
    };
    return PMRDetail;
}
