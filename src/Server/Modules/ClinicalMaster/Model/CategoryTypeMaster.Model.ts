import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CategoryTypeMasterInstance, i.CategoryTypeMasterAttributes> {
    let CategoryTypeMaster = sequelize.define<i.CategoryTypeMasterInstance, i.CategoryTypeMasterAttributes>('CategoryTypeMaster', {
       Id: { type: DataTypes.BIGINT, field: 'CategoryTypeMasterId', primaryKey: true, autoIncrement: true  },
       Name: { type: DataTypes.STRING, field: 'Name' },
       Description: { type: DataTypes.STRING, field: 'Description' },
       CategoryTypeRefId: { type: DataTypes.BIGINT, field: 'CategoryTypeRefId' },
       IsAssociatedWithCC: { type: DataTypes.BOOLEAN, field: 'IsAssociatedWithCC' },
       IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
       ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'categorytypemasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CategoryTypeMaster as any).associate = function(models: Models) {
                    CategoryTypeMaster.belongsTo(models.ReferenceValue, { as: 'CategoryTypeRef', targetKey: 'ReferenceValueCodeId' });
                    CategoryTypeMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return CategoryTypeMaster;
}
