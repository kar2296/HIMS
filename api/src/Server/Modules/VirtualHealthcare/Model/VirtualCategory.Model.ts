import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualCategoryInstance, i.VirtualCategoryAttributes> {
    let VirtualCategory = sequelize.define<i.VirtualCategoryInstance, i.VirtualCategoryAttributes>('VirtualCategory', {
        Id: { type: DataTypes.BIGINT, field: 'CategoryId', primaryKey: true, autoIncrement: true },
        CategoryCode: { type: DataTypes.STRING, field: 'CategoryCode' },
        CategoryName: { type: DataTypes.STRING, field: 'CategoryName' },
        CategoryDescription: { type: DataTypes.STRING, field: 'CategoryDescription' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        ConsultancyTypeId: { type: DataTypes.BIGINT, field: 'ConsultancyTypeId' },
        Imagepath: { type: DataTypes.STRING, field: 'Imagepath' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsLabCategory: { type: DataTypes.BOOLEAN, field: 'IsLabCategory' },
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
            tableName: 'hims_virtualcategory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VirtualCategory as any).associate = function (models: Models) {
        VirtualCategory.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        VirtualCategory.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    };
    return VirtualCategory;
}
