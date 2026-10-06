import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FacilitySettingInstance, i.FacilitySettingAttributes> {
    let FacilitySetting = sequelize.define<i.FacilitySettingInstance, i.FacilitySettingAttributes>('FacilitySetting', {
        Id: { type: DataTypes.BIGINT, field: 'FacilitySettingId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        MinLoginNameLength: { type: DataTypes.INTEGER, field: 'MinLoginNameLength' },
        MaxLoginNameLength: { type: DataTypes.INTEGER, field: 'MaxLoginNameLength' },
        ReqNoOfLoginDigit: { type: DataTypes.INTEGER, field: 'ReqNoOfLoginDigit' },
        MinPwdLength: { type: DataTypes.INTEGER, field: 'MinPwdLength' },
        MaxPwdLength: { type: DataTypes.INTEGER, field: 'MaxPwdLength' },
        IsSpecialCharacterAllowedinPwd: { type: DataTypes.BOOLEAN, field: 'IsSpecialCharacterAllowedinPwd' },
        DefaultPwd: { type: DataTypes.STRING, field: 'DefaultPwd' },
        MaxFailedLoginAttempts: { type: DataTypes.INTEGER, field: 'MaxFailedLoginAttempts' },
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
            tableName: 'facilitysettings',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return FacilitySetting;
}
