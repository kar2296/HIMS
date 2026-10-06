import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProfileUserInstance, i.ProfileUserAttributes> {
    let ProfileUser = sequelize.define<i.ProfileUserInstance, i.ProfileUserAttributes>('ProfileUser', {
        Id: { type: DataTypes.BIGINT, field: 'ProfileUserId', primaryKey: true, autoIncrement: true },
        ProfileId: { type: DataTypes.BIGINT, field: 'ProfileId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        VisitTypeId: { type: DataTypes.BIGINT, field: 'VisitTypeId' },
        IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
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
            tableName: 'profileusers',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ProfileUser as any).associate = function (models: Models) {
        ProfileUser.belongsTo(models.Facility);
        ProfileUser.belongsTo(models.User);
        ProfileUser.belongsTo(models.Department);
        ProfileUser.belongsTo(models.ProfileMaster, { foreignKey: 'ProfileId' });
        ProfileUser.belongsTo(models.ReferenceValue, { as: 'VisitType', targetKey: 'ReferenceValueCodeId' });
    };
    return ProfileUser;
}
