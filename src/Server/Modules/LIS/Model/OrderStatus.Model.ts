import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OrderStatusInstance, i.OrderStatusAttributes> {
    let OrderStatus = sequelize.define<i.OrderStatusInstance, i.OrderStatusAttributes>('OrderStatus', {
        Id: { type: DataTypes.BIGINT, field: 'OrderStatusId', primaryKey: true, autoIncrement: true },
        Menmonics: { type: DataTypes.STRING, field: 'Menmonics' },
        Orderstatuse: { type: DataTypes.STRING, field: 'Orderstatuse' },
        DisplayName: { type: DataTypes.STRING, field: 'DisplayName' },
        HL7Code: { type: DataTypes.STRING, field: 'HL7Code' },
        Type: { type: DataTypes.INTEGER, field: 'Type' },
        ActiveStaute: { type: DataTypes.INTEGER, field: 'ActiveStaute' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        IsDietStatus: { type: DataTypes.BOOLEAN, field: 'IsDietStatus' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'orderstatus',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return OrderStatus;
}
