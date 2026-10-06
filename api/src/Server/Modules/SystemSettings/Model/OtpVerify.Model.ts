import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OtpVerifyInstance, i.OtpVerifyAttributes> {
    let OtpVerify = sequelize.define<i.OtpVerifyInstance, i.OtpVerifyAttributes>('OtpVerify', {
        Id: { type: DataTypes.BIGINT, field: 'OtpId', primaryKey: true, autoIncrement: true },
        CountryCode: { type: DataTypes.STRING, field: 'CountryCode' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        Otp: { type: DataTypes.STRING, field: 'Otp' },
        IsOtpVerified: { type: DataTypes.BOOLEAN, field: 'IsOtpVerified' },
        ForgotOtp: { type: DataTypes.STRING, field: 'ForgotOtp' },
        IsForgotOtpVerified: { type: DataTypes.BOOLEAN, field: 'IsForgotOtpVerified' },
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
            tableName: 'hims_otpverifications',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    return OtpVerify;
}
