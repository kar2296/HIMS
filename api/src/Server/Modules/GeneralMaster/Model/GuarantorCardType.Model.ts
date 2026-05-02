import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GuarantorCardTypeInstance, i.GuarantorCardTypeAttributes> {
    let GuarantorCardType = sequelize.define<i.GuarantorCardTypeInstance, i.GuarantorCardTypeAttributes>('GuarantorCardType', {
        Id: { type: DataTypes.BIGINT, field: 'GuarantorCardTypeId', primaryKey: true, autoIncrement: true },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CardMasterId: { type: DataTypes.BIGINT, field: 'CardMasterId' },
        CardMasterTypeId: { type: DataTypes.BIGINT, field: 'CardMasterTypeId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        CardName: { type: DataTypes.STRING, field: 'CardName' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'guarantorcardtypes',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    // (GuarantorCardType as any).associate = function (models: Models) {

    // };
    return GuarantorCardType;
}
