import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RoleInstance, i.RoleAttributes> {
    let Role = sequelize.define<i.RoleInstance, i.RoleAttributes>('Role', {
        Id: { type: DataTypes.BIGINT, field: 'RoleId', primaryKey: true, autoIncrement: true },
        RoleCode: { type: DataTypes.STRING, field: 'RoleCode' },
        RoleName: { type: DataTypes.STRING, field: 'RoleName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        LandingControlId: { type: DataTypes.BIGINT, field: 'LandingControlId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
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
            tableName: 'roles',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Role as any).associate = function(models: Models) {
                    Role.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Role.belongsToMany(models.Group, { through: models.GroupRoleMap });
                    Role.belongsToMany(models.Control, { through: models.RoleControlMap });
                    Role.belongsTo(models.Facility, { as: 'Facility', foreignKey: 'FacilityId' });
                    Role.belongsTo(models.Control, { as: 'LandingControl', foreignKey: 'LandingControlId' });
                    Role.hasMany(models.RolePrivilege);
                };
 return Role;
}
