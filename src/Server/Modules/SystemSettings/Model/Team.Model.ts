import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TeamInstance, i.TeamAttributes> {
    let Team = sequelize.define<i.TeamInstance, i.TeamAttributes>('Team', {
        Id: { type: DataTypes.BIGINT, field: 'TeamId', primaryKey: true, autoIncrement: true },
        TeamName: { type: DataTypes.STRING, field: 'TeamName' },
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
            tableName: 'teams',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return Team;
}
