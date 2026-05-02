import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CategoryInstance, i.CategoryAttributes> {
    let Category = sequelize.define<i.CategoryInstance, i.CategoryAttributes>('Category', {
       Id: { type: DataTypes.BIGINT, field: 'CategoryId', primaryKey: true, autoIncrement: true  },
       CategoryName: { type: DataTypes.STRING, field: 'CategoryName' },
       CategoryTypeId: { type: DataTypes.BIGINT, field: 'CategoryTypeId' },
       CategoryType: { type: DataTypes.STRING, field: 'CategoryType' },
       CategoryIdentifier: { type: DataTypes.STRING, field: 'CategoryIdentifier' },
       CategoryGroupId: { type: DataTypes.BIGINT, field: 'CategoryGroupId' },
       Description: { type: DataTypes.STRING, field: 'Description' },
       ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
       IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
       IsPrint: { type: DataTypes.BOOLEAN, field: 'IsPrint' },
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
            tableName: 'hims_templateparameters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Category as any).associate = function(models: Models) {
                    Category.hasMany(models.Concept);
                };
 return Category;
}
