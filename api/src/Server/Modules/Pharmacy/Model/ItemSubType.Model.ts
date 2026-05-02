import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemSubTypeInstance, i.ItemSubTypeAttributes> {
    let ItemSubType = sequelize.define<i.ItemSubTypeInstance, i.ItemSubTypeAttributes>('ItemSubType', {
        Id: { type: DataTypes.BIGINT, field: 'SubTypeId', primaryKey: true, autoIncrement: true },
        SubTypeCode: { type: DataTypes.STRING, field: 'SubTypeCode' },
        SubTypeName: { type: DataTypes.STRING, field: 'SubTypeName' },
        SubTypeDescription: { type: DataTypes.STRING, field: 'SubTypeDescription' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
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
            tableName: 'itemsubtype',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ItemSubType as any).associate = function(models: Models) {
                    ItemSubType.belongsTo(models.Facility);
                    ItemSubType.belongsTo(models.ItemCategory, { foreignKey: 'CategoryId' });
                    ItemSubType.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ItemSubType;
}
