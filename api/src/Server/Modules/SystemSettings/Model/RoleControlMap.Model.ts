import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RoleControlMapInstance, i.RoleControlMapAttributes> {
    let RoleControlMap = sequelize.define<i.RoleControlMapInstance, i.RoleControlMapAttributes>('RoleControlMap', {
       RoleId: { type: DataTypes.BIGINT, field: 'RoleId', primaryKey: true },
       ControlId: { type: DataTypes.BIGINT, field: 'ControlId', primaryKey: true },
       DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
       CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
       CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
       UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
       UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'rolecontrolmap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

     (RoleControlMap as any).associate = function(models: Models) {
                    RoleControlMap.belongsTo(models.Role);
                    RoleControlMap.belongsTo(models.Control);
                };
 return RoleControlMap;
}
