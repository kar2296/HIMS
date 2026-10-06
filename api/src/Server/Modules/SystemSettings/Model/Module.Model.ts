import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ModuleInstance, i.ModuleAttributes> {
    let Module = sequelize.define<i.ModuleInstance, i.ModuleAttributes>('Module', {
       Id: { type :DataTypes.BIGINT, field: 'ModuleId', primaryKey: true, autoIncrement: true  },
       ModuleCode: { type :DataTypes.STRING, field: 'ModuleCode' },
       ModuleName: { type :DataTypes.STRING, field: 'ModuleName' },
       DisplayOrder: { type :DataTypes.INTEGER, field: 'DisplayOrder' },
       URL: { type :DataTypes.STRING, field: 'URL' },
       IsEnabled: { type :DataTypes.BOOLEAN, field: 'IsEnabled' },
       Status: { type :DataTypes.INTEGER, field: 'Status' },
       Rev: { type :DataTypes.INTEGER, field: 'Rev' },
       CreatedBy: { type :DataTypes.INTEGER, field: 'CreatedBy' },
       CreatedAt: { type :DataTypes.DATE, field: 'CreatedAt' },
       UpdatedBy: { type :DataTypes.INTEGER, field: 'UpdatedBy' },
       UpdatedAt: { type :DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'modules',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Module as any).associate = function(models: Models) {
                   Module.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Module;
}
