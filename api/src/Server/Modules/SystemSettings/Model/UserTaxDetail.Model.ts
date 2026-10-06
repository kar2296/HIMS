import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserTaxDetailInstance, i.UserTaxDetailAttributes> {
    let UserTaxDetail = sequelize.define<i.UserTaxDetailInstance, i.UserTaxDetailAttributes>('UserTaxDetail', {
        Id: { type: DataTypes.BIGINT, field: 'TaxDetailId', primaryKey: true, autoIncrement: true },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        IsGSTRegistered: { type: DataTypes.BOOLEAN, field: 'IsGSTRegistered' },
        GSTId: { type: DataTypes.STRING, field: 'GSTId' },
        BusinessRegNo: { type: DataTypes.STRING, field: 'BusinessRegNo' },
        BusinessName: { type: DataTypes.STRING, field: 'BusinessName' },
        BusinessAddress: { type: DataTypes.STRING, field: 'BusinessAddress' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
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
            tableName: 'usertaxdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return UserTaxDetail;
}
