import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserDepartmentMapInstance, i.UserDepartmentMapAttributes> {
    let UserDepartmentMap = sequelize.define<i.UserDepartmentMapInstance, i.UserDepartmentMapAttributes>('UserDepartmentMap', {
        UserId: { type: DataTypes.BIGINT, field: 'UserId', primaryKey: true },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId', primaryKey: true },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'userdepartmentmap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

     (UserDepartmentMap as any).associate = function(models: Models) {
                    UserDepartmentMap.belongsTo(models.User);
                    UserDepartmentMap.belongsTo(models.Department);
                };
 return UserDepartmentMap;
}
