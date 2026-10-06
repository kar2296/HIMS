import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualSubCategoryInstance, i.VirtualSubCategoryAttributes> {
    let VirtualSubCategory = sequelize.define<i.VirtualSubCategoryInstance, i.VirtualSubCategoryAttributes>('VirtualSubCategory', {
        Id: { type: DataTypes.BIGINT, field: 'SubCategoryId', primaryKey: true, autoIncrement: true },
        SubCategoryCode: { type: DataTypes.STRING, field: 'SubCategoryCode' },
        SubCategoryName: { type: DataTypes.STRING, field: 'SubCategoryName' },
        SubCategoryDescription: { type: DataTypes.STRING, field: 'SubCategoryDescription' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        Imagepath: { type: DataTypes.STRING, field: 'Imagepath' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsHome: { type: DataTypes.BOOLEAN, field: 'IsHome' },
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
            tableName: 'hims_virtualsubcategory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VirtualSubCategory as any).associate = function (models: Models) {
        VirtualSubCategory.belongsTo(models.Facility);
        VirtualSubCategory.belongsTo(models.VirtualCategory, { foreignKey: 'CategoryId' });
        VirtualSubCategory.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return VirtualSubCategory;
}
