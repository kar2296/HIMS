import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LocalWellCustomerOrderInstance, i.LocalWellCustomerOrderAttributes> {
    let LocalWellCustomerOrder = sequelize.define<i.LocalWellCustomerOrderInstance, i.LocalWellCustomerOrderAttributes>
    ('LocalWellCustomerOrder', {
        Id: { type: DataTypes.BIGINT, field: 'LocalWellCustomerOrderId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        CustomerId: { type: DataTypes.BIGINT, field: 'CustomerId' },
        CustomerOrderId: { type: DataTypes.BIGINT, field: 'CustomerOrderId' },
        OrderedDate: { type: DataTypes.DATE, field: 'OrderedDate' },
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
            tableName: 'localwellcustomerorder',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return LocalWellCustomerOrder;
}
