import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ContextControlMapInstance, i.ContextControlMapAttributes> {
    let ContextControlMap = sequelize.define<i.ContextControlMapInstance, i.ContextControlMapAttributes>('ContextControlMap', {
        ContextId: { type: DataTypes.BIGINT, field: 'ContextId', primaryKey: true },
        ControlId: { type: DataTypes.BIGINT, field: 'ControlId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'contextcontrolmap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ContextControlMap as any).associate = function(models: Models) {
                    ContextControlMap.belongsTo(models.Context);
                    ContextControlMap.belongsTo(models.Control);
                };
 return ContextControlMap;
}
