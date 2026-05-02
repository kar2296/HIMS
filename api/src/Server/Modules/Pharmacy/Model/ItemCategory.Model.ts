import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemCategoryInstance, i.ItemCategoryAttributes> {
    let ItemCategory = sequelize.define<i.ItemCategoryInstance, i.ItemCategoryAttributes>('ItemCategory', {
       Id: { type: DataTypes.BIGINT, field: 'CategoryId', primaryKey: true, autoIncrement: true  },
       CategoryCode: { type: DataTypes.STRING, field: 'CategoryCode' },
       CategoryName: { type: DataTypes.STRING, field: 'CategoryName' },
       CategoryDescription: { type: DataTypes.STRING, field: 'CategoryDescription' },
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
            tableName: 'itemcategory',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ItemCategory as any).associate = function(models: Models) {
                     ItemCategory.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                     ItemCategory.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
                };
 return ItemCategory;
}
