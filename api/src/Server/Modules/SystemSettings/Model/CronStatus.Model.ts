import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CronStatusInstance, i.CronStatusAttributes> {
    let CronStatus = sequelize.define<i.CronStatusInstance, i.CronStatusAttributes>('CronStatus', {
        Id: { type: DataTypes.BIGINT, field: 'CronId', primaryKey: true, autoIncrement: true },
        CronDescription: { type: DataTypes.STRING, field: 'CronDescription' },
        CompletedStatusId: { type: DataTypes.BOOLEAN, field: 'CompletedStatusId' },
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
            tableName: 'cronstatus',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {}
        });

    return CronStatus;
}
