import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OrderTypeInstance, i.OrderTypeAttributes> {
    let OrderType = sequelize.define<i.OrderTypeInstance, i.OrderTypeAttributes>('OrderType', {
        Id: { type: DataTypes.BIGINT, field: 'OrderTypeId', primaryKey: true, autoIncrement: true },
        Menmonics: { type: DataTypes.STRING, field: 'Menmonics' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        DisplayName: { type: DataTypes.STRING, field: 'DisplayName' },
        HL7Code: { type: DataTypes.STRING, field: 'HL7Code' },
        Type: { type: DataTypes.INTEGER, field: 'Type' },
        ActiveStaute: { type: DataTypes.INTEGER, field: 'ActiveStaute' },
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
            tableName: 'ordertype',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return OrderType;
}
