import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GroupRoleMapInstance, i.GroupRoleMapAttributes> {
    let GroupRoleMap = sequelize.define<i.GroupRoleMapInstance, i.GroupRoleMapAttributes>('GroupRoleMap', {
        GroupId: { type: DataTypes.BIGINT, field: 'GroupId', primaryKey: true },
        RoleId: { type: DataTypes.BIGINT, field: 'RoleId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'grouprolemap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

     (GroupRoleMap as any).associate = function(models: Models) {
                    GroupRoleMap.belongsTo(models.Group);
                    GroupRoleMap.belongsTo(models.Role);
                };
 return GroupRoleMap;
}
