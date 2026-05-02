import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProductSubTypeInstance, i.ProductSubTypeAttributes> {
    let ProductSubType = sequelize.define<i.ProductSubTypeInstance, i.ProductSubTypeAttributes>('ProductSubType', {
        Id: { type: DataTypes.BIGINT, field: 'SubProductTypeId', primaryKey: true, autoIncrement: true },
        SubProductTypeCode: { type: DataTypes.STRING, field: 'SubProductTypeCode' },
        SubProductTypeName: { type: DataTypes.STRING, field: 'SubProductTypeName' },
        SubProductTypeDescription: { type: DataTypes.STRING, field: 'SubProductTypeDescription' },
       CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        ProductSubType: { type: DataTypes.BIGINT, field: 'ProductSubType' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [], timestamps: true,
            tableName: 'productsubtype',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ProductSubType as any).associate = function(models: Models) {
                    ProductSubType.belongsTo(models.Facility);
                    ProductSubType.belongsTo(models.ItemCategory, { foreignKey: 'CategoryId' });
                    ProductSubType.belongsTo(models.ItemSubCategory, { foreignKey: 'SubCategoryId' });
                    ProductSubType.belongsTo(models.ProductType, { foreignKey: 'ProductTypeId' });
                    ProductSubType.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ProductSubType;
}
