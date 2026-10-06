import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserFacilityMapInstance, i.UserFacilityMapAttributes> {
    let UserFacilityMap = sequelize.define<i.UserFacilityMapInstance, i.UserFacilityMapAttributes>('UserFacilityMap', {
        Id: { type: DataTypes.BIGINT, field: 'Id', primaryKey: true, autoIncrement: true },
        Rev: { type: DataTypes.INTEGER, field: 'Rev', defaultValue: 0 }, // Add Rev field
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Status: { type: DataTypes.INTEGER, field: 'Status', defaultValue: 1 }, // Add Status field
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'userfacilitymap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (UserFacilityMap as any).associate = function (models: any) { // Changed Models to any
        UserFacilityMap.belongsTo(models.User, { as: 'User', foreignKey: 'UserId' });
        UserFacilityMap.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    };
    return UserFacilityMap;
}
