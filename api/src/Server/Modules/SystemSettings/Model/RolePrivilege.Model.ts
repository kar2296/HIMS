import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RolePrivilegeInstance, i.RolePrivilegeAttributes> {
    let RolePrivilege = sequelize.define<i.RolePrivilegeInstance, i.RolePrivilegeAttributes>('RolePrivilege', {
       Id: { type: DataTypes.BIGINT, field: 'RolePrivilegeId', primaryKey: true, autoIncrement: true  },
       RoleId: { type: DataTypes.BIGINT, field: 'RoleId' },
       RoleCode: { type: DataTypes.STRING, field: 'RoleCode' },
       FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       AccessObjectTypeId: { type: DataTypes.BIGINT, field: 'AccessObjectTypeId' },
       AccessObjectType: { type: DataTypes.STRING, field: 'AccessObjectType' },
       AccessActionId: { type: DataTypes.BIGINT, field: 'AccessActionId' },
       AccessAction: { type: DataTypes.STRING, field: 'AccessAction' },
       Access: { type: DataTypes.STRING, field: 'Access' },
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
            tableName: 'roleprivileges',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (RolePrivilege as any).associate = function(models: Models) {
                    RolePrivilege.belongsTo(models.Facility);
                };
 return RolePrivilege;
}
