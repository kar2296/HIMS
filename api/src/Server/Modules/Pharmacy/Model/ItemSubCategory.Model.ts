import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemSubCategoryInstance, i.ItemSubCategoryAttributes> {
    let ItemSubCategory = sequelize.define<i.ItemSubCategoryInstance, i.ItemSubCategoryAttributes>('ItemSubCategory', {
        Id: { type: DataTypes.BIGINT, field: 'SubCategoryId', primaryKey: true, autoIncrement: true },
        SubCategoryCode: { type: DataTypes.STRING, field: 'SubCategoryCode' },
        SubCategoryName: { type: DataTypes.STRING, field: 'SubCategoryName' },
        SubCategoryDescription: { type: DataTypes.STRING, field: 'SubCategoryDescription' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
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
            tableName: 'itemsubcategory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ItemSubCategory as any).associate = function(models: Models) {
                    ItemSubCategory.belongsTo(models.Facility);
                    ItemSubCategory.belongsTo(models.ItemCategory, { foreignKey: 'CategoryId' });
                    ItemSubCategory.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ItemSubCategory;
}
