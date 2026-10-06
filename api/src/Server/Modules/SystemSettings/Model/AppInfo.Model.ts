import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AppInfoInstance, i.AppInfoAttributes> {
    let AppInfo = sequelize.define<i.AppInfoInstance, i.AppInfoAttributes>('AppInfo', {
        Id: { type: DataTypes.BIGINT, field: 'AppInfoId', primaryKey: true, autoIncrement: true },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Version: { type: DataTypes.STRING, field: 'Version' },
        UpdatedDate: { type: DataTypes.DATE, field: 'UpdatedDate' },
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
            tableName: 'AppInfo',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {}
        });

    return AppInfo;
}
