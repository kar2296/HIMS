import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ScreenInstance, i.ScreenAttributes> {
    let Screen = sequelize.define<i.ScreenInstance, i.ScreenAttributes>('Screen', {
        Id: { type: DataTypes.BIGINT, field: 'ScreenId', primaryKey: true, autoIncrement: true },
        ModuleId: { type: DataTypes.BIGINT, field: 'ModuleId' },
        ScreenCode: { type: DataTypes.STRING, field: 'ScreenCode' },
        ScreenName: { type: DataTypes.STRING, field: 'ScreenName' },
        GroupName: { type: DataTypes.STRING, field: 'GroupName' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        URL: { type: DataTypes.STRING, field: 'URL' },
        ImagePath: { type: DataTypes.STRING, field: 'ImagePath' },
        IsEnabled: { type: DataTypes.BOOLEAN, field: 'IsEnabled' },
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
            tableName: 'screens',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return Screen;
}
