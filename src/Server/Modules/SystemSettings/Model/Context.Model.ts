import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ContextInstance, i.ContextAttributes> {
    let Context = sequelize.define<i.ContextInstance, i.ContextAttributes>('Context', {
       Id: { type: DataTypes.BIGINT, field: 'ContextId', primaryKey: true, autoIncrement: true  },
       ParentContextId: { type: DataTypes.BIGINT, field: 'ParentContextId' },
       ContextName: { type: DataTypes.STRING, field: 'ContextName' },
       Display: { type: DataTypes.STRING, field: 'Display' },
       DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
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
            tableName: 'contexts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Context as any).associate = function(models: Models) {
                    Context.belongsToMany(models.Control, { through: models.ContextControlMap });
                };
 return Context;
}
