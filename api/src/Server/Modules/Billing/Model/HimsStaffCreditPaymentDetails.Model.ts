import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StaffCreditPaymentDetailsInstance, i.StaffCreditPaymentDetailsAttributes> {
    let StaffCreditPaymentDetails = sequelize.define<i.StaffCreditPaymentDetailsInstance,
        i.StaffCreditPaymentDetailsAttributes>('StaffCreditPaymentDetails', {
            Id: { type: DataTypes.BIGINT, field: 'StaffCreditPaymentDetailId', primaryKey: true, autoIncrement: true },
            StaffCreditPaymentId: { type: DataTypes.BIGINT, field: 'StaffCreditPaymentId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            StaffId: { type: DataTypes.BIGINT, field: 'StaffId' },
            StaffName: { type: DataTypes.STRING, field: 'StaffName' },
            BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
            BillDate: { type: DataTypes.DATE, field: 'BillDate' },
            BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
            ReceiptAmount: { type: DataTypes.DECIMAL, field: 'ReceiptAmount' },
            PaidAmount: { type: DataTypes.DECIMAL, field: 'PaidAmount' },
            BalanceAmount: { type: DataTypes.DECIMAL, field: 'BalanceAmount' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
            ApprovedAt: { type: DataTypes.DATE, field: 'ApprovedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'staffcreditpaymentdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    // (StaffCreditPaymentDetails as any).associate = function (models: Models) {
    //     // StaffCreditPaymentDetails.belongsTo(models.DoctorInvoice, { foreignKey: 'DoctorInvoiceId' });
    //     // StaffCreditPaymentDetails.belongsTo(models.StaffCreditPayment, { foreignKey: 'StaffCreditPaymentId' });
    //     // StaffCreditPaymentDetails.belongsTo(models.ReferenceValue, { as: 'PaymentStatus', targetKey: 'ReferenceValueCodeId' });
    // };
    return StaffCreditPaymentDetails;
}
