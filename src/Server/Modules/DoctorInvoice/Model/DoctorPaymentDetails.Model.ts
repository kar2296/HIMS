import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DoctorPaymentDetailsInstance, i.DoctorPaymentDetailsAttributes> {
    let DoctorPaymentDetails = sequelize.define<i.DoctorPaymentDetailsInstance,
        i.DoctorPaymentDetailsAttributes>('DoctorPaymentDetails', {
            Id: { type: DataTypes.BIGINT, field: 'DoctorPaymentDetailId', primaryKey: true, autoIncrement: true },
            DoctorPaymentId: { type: DataTypes.BIGINT, field: 'DoctorPaymentId' },
            DoctorInvoiceId: { type: DataTypes.BIGINT, field: 'DoctorInvoiceId' },
            PaymentDateTime: { type: DataTypes.DATE, field: 'PaymentDateTime' },
            InvoiceAmount: { type: DataTypes.DECIMAL, field: 'InvoiceAmount' },
            PaymentAmount: { type: DataTypes.DECIMAL, field: 'PaymentAmount' },
            PaymentStatusId: { type: DataTypes.INTEGER, field: 'PaymentStatusId' },
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
                tableName: 'doctorpaymentdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (DoctorPaymentDetails as any).associate = function (models: Models) {
        DoctorPaymentDetails.belongsTo(models.DoctorInvoice, { foreignKey: 'DoctorInvoiceId' });
        DoctorPaymentDetails.belongsTo(models.DoctorPayment, { foreignKey: 'DoctorPaymentId' });
        DoctorPaymentDetails.belongsTo(models.ReferenceValue, { as: 'PaymentStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return DoctorPaymentDetails;
}
