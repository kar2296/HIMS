import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VendorPaymentDetailsInstance, i.VendorPaymentDetailsAttributes> {
    let VendorPaymentDetails = sequelize.define<i.VendorPaymentDetailsInstance,
        i.VendorPaymentDetailsAttributes>('VendorPaymentDetails', {
            Id: { type: DataTypes.BIGINT, field: 'VendorPaymentDetailId', primaryKey: true, autoIncrement: true },
            VendorPaymentId: { type: DataTypes.BIGINT, field: 'VendorPaymentId' },
            GrnId: { type: DataTypes.BIGINT, field: 'GrnId' },
            InvoiceNo: { type: DataTypes.STRING, field: 'InvoiceNo' },
            InvoiceDate: { type: DataTypes.DATE, field: 'InvoiceDate' },
            GrnNo: { type: DataTypes.STRING, field: 'GrnNo' },
            ReturnNo: { type: DataTypes.STRING, field: 'ReturnNo' },
            ReturnDate: { type: DataTypes.DATE, field: 'ReturnDate' },
            ReturnAmount: { type: DataTypes.DECIMAL, field: 'ReturnAmount' },
            GrnDate: { type: DataTypes.DATE, field: 'GrnDate' },
            InvoiceAmount: { type: DataTypes.DECIMAL, field: 'InvoiceAmount' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            PaidAmount: { type: DataTypes.DECIMAL, field: 'PaidAmount' },
            BalanceAmount: { type: DataTypes.DECIMAL, field: 'BalanceAmount' },
            TDSPercentageId: { type: DataTypes.BIGINT, field: 'TDSPercentageId' },
            TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
            WriteOff: { type: DataTypes.DECIMAL, field: 'WriteOff' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            ApprovedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            ApprovedAt: { type: DataTypes.DATE, field: 'ApprovedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'vendorpaymentdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (VendorPaymentDetails as any).associate = function (models: Models) {
        VendorPaymentDetails.belongsTo(models.VendorPayment);
    };
    return VendorPaymentDetails;
}
