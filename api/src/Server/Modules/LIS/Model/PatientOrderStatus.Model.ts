import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientOrderStatusInstance, i.PatientOrderStatusAttributes> {
    let PatientOrderStatus = sequelize.define<i.PatientOrderStatusInstance, i.PatientOrderStatusAttributes>('PatientOrderStatus', {
        Id: { type: DataTypes.BIGINT, field: 'Orderstatusid', primaryKey: true, autoIncrement: true },
        Encountersorderid: { type: DataTypes.BIGINT, field: 'Encountersorderid' },
        Orderdetailsid: { type: DataTypes.BIGINT, field: 'Orderdetailsid' },
        orderdetailstatus: { type: DataTypes.BIGINT, field: 'orderdetailstatus' },
        statuschangeddate: { type: DataTypes.DATE, field: 'statuschangeddate' },
        billdate: { type: DataTypes.DATE, field: 'billdate' },
        billingid: { type: DataTypes.BIGINT, field: 'billingid' },
        statusnotes: { type: DataTypes.STRING, field: 'statusnotes' },
        Quantity: { type: DataTypes.BIGINT, field: 'Quantity' },
        statuschangedby: { type: DataTypes.INTEGER, field: 'statuschangedby' },
        statuschangedbyname: { type: DataTypes.STRING, field: 'statuschangedbyname' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientorderstatus',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return PatientOrderStatus;
}
