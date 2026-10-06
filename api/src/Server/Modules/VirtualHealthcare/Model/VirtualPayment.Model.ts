import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';
export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualPaymentInstance, i.VirtualPaymentAttributes> {
    let VirtualPayment = sequelize.define<i.VirtualPaymentInstance, i.
        VirtualPaymentAttributes>('VirtualPayment', {
            Id: { type: DataTypes.BIGINT, field: 'OrderPaymentId', primaryKey: true, autoIncrement: true },
            PaymentDateTime: { type: DataTypes.DATE, field: 'PaymentDateTime' },
            PaymentNumber: { type: DataTypes.STRING, field: 'PaymentNumber' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            ReceiptTypeId: { type: DataTypes.BIGINT, field: 'ReceiptTypeId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            BillAmount: { type: DataTypes.DOUBLE, field: 'BillAmount' },
            AmountPaid: { type: DataTypes.DOUBLE, field: 'AmountPaid' },
            DueAmount: { type: DataTypes.DOUBLE, field: 'DueAmount' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            PaymentModeId: { type: DataTypes.BIGINT, field: 'PaymentModeId' },
            PaymentDoneById: { type: DataTypes.BIGINT, field: 'PaymentDoneById' },
            PaymentTypeId: { type: DataTypes.BIGINT, field: 'PaymentTypeId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            VirtualCategoryId: { type: DataTypes.BIGINT, field: 'VirtualCategoryId' },
            VirtualSubCategoryId: { type: DataTypes.BIGINT, field: 'VirtualSubCategoryId' },
            CategoryTypeId: { type: DataTypes.BIGINT, field: 'CategoryTypeId' },
            VirtualOrderId: { type: DataTypes.BIGINT, field: 'VirtualOrderId' },
            VirtualBillId: { type: DataTypes.BIGINT, field: 'VirtualBillId' },
            VirtualBillTypeId: { type: DataTypes.INTEGER, field: 'VirtualBillTypeId' },
            CardNumber: { type: DataTypes.BIGINT, field: 'CardNumber' },
            CardDateTime: { type: DataTypes.DATE, field: 'CardDateTime' },
            CardExpiryDate: { type: DataTypes.DATE, field: 'CardExpiryDate' },
            BankId: { type: DataTypes.INTEGER, field: 'BankId' },
            CardTypeId: { type: DataTypes.INTEGER, field: 'CardTypeId' },
            TerminalNoId: { type: DataTypes.INTEGER, field: 'TerminalNoId' },
            CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
            AuthorizeNumber: { type: DataTypes.INTEGER, field: 'AuthorizeNumber' },
            AuthorizedCode: { type: DataTypes.STRING, field: 'AuthorizedCode' },
            ChequeNo: { type: DataTypes.INTEGER, field: 'ChequeNo' },
            ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
            CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
            DDNumber: { type: DataTypes.INTEGER, field: 'DDNumber' },
            DDDate: { type: DataTypes.DATE, field: 'DDDate' },
            WireTransferId: { type: DataTypes.INTEGER, field: 'WireTransferId' },
            WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
            PaymentStatusId: { type: DataTypes.INTEGER, field: 'PaymentStatusId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            // REMOVED: PayModeHistory: { type: DataTypes.TEXT, field: 'PayModeHistory' },
        },
            {
                indexes: [], timestamps: true,
                tableName: 'hims_virtualbillpayments',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });
    (VirtualPayment as any).associate = function (models: any) {
        VirtualPayment.belongsTo(models.VirtualCategory, { foreignKey: 'VirtualCategoryId' });
        VirtualPayment.belongsTo(models.VirtualSubCategory, { foreignKey: 'VirtualSubCategoryId' });
        VirtualPayment.belongsTo(models.ReferenceValue, {
            as: 'ConsultancyType', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'CategoryTypeId'
        });
        VirtualPayment.belongsTo(models.ReferenceValue, {
            as: 'PaymentStatus', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'PaymentStatusId'
        });
    };
    return VirtualPayment;
}
