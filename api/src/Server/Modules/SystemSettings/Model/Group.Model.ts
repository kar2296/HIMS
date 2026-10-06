import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GroupInstance, i.GroupAttributes> {
    let Group = sequelize.define<i.GroupInstance, i.GroupAttributes>('Group', {
        Id: { type: DataTypes.BIGINT, field: 'GroupId', primaryKey: true, autoIncrement: true },
        GroupCode: { type: DataTypes.STRING, field: 'GroupCode' },
        GroupName: { type: DataTypes.STRING, field: 'GroupName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'groups',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Group as any).associate = function(models: Models) {
                    Group.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Group.belongsToMany(models.Role, { through: models.GroupRoleMap });
                    Group.belongsTo(models.Facility, { as: 'Facility', foreignKey: 'FacilityId' });
                };
 return Group;
}
