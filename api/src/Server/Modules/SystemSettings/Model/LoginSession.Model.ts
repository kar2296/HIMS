import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LoginSessionInstance, i.LoginSessionAttributes> {
    let LoginSession = sequelize.define<i.LoginSessionInstance, i.LoginSessionAttributes>('LoginSession', {
        Id: { type: DataTypes.BIGINT, field: 'LoginSessionId', primaryKey: true, autoIncrement: true },
        UserId: { type: DataTypes.BIGINT, field: 'UserId', primaryKey: true },
        UserName: { type: DataTypes.STRING, field: 'UserName' },
        LoginTime: { type: DataTypes.DATE, field: 'LoginTime' },
        LogoutTime: { type: DataTypes.DATE, field: 'LogoutTime' },
        SessionId: { type: DataTypes.STRING, field: 'SessionId' },
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
            tableName: 'loginsessions',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {}
        });



    return LoginSession;
}
