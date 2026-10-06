import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserTeamInstance, i.UserTeamAttributes> {
    let UserTeam = sequelize.define<i.UserTeamInstance, i.UserTeamAttributes>('UserTeam', {
       Id: { type: DataTypes.BIGINT, field: 'UserTeamId', primaryKey: true, autoIncrement: true  },
       UserId: { type: DataTypes.BIGINT, field: 'UserId' },
       TeamId: { type: DataTypes.BIGINT, field: 'TeamId' },
       GroupId: { type: DataTypes.BIGINT, field: 'GroupId' },
       ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
       ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
       Comments: { type: DataTypes.STRING, field: 'Comments' },
       Status: { type: DataTypes.INTEGER, field: 'Status' },
       IsDefault: { type: DataTypes.BOOLEAN, field: 'IsDefault' },
       Rev: { type: DataTypes.INTEGER, field: 'Rev' },
       CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
       CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
       UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
       UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'userteams',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (UserTeam as any).associate = function (models: Models) {
        // UserTeam.belongsTo(models.Team);
        UserTeam.belongsTo(models.ReferenceValue, { as: 'Team', targetKey: 'ReferenceValueCodeId' });
                };
 return UserTeam;
}
