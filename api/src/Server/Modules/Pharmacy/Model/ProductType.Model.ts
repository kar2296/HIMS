import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProductTypeInstance, i.ProductTypeAttributes> {
    let ProductType = sequelize.define<i.ProductTypeInstance, i.ProductTypeAttributes>('ProductType', {
        Id: { type: DataTypes.BIGINT, field: 'ProductTypeId', primaryKey: true, autoIncrement: true },
        ProductTypeCode: { type: DataTypes.STRING, field: 'ProductTypeCode' },
        ProductTypeName: { type: DataTypes.STRING, field: 'ProductTypeName' },
        ProductTypeDescription: { type: DataTypes.STRING, field: 'ProductTypeDescription' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        SubTypeId: { type: DataTypes.BIGINT, field: 'SubTypeId' },
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
            tableName: 'producttype',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ProductType as any).associate = function(models: Models) {
                    ProductType.belongsTo(models.Facility);
                    ProductType.belongsTo(models.ItemCategory, { foreignKey: 'CategoryId' });
                    ProductType.belongsTo(models.ItemSubCategory, { foreignKey: 'SubCategoryId' });
                    ProductType.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ProductType;
}
