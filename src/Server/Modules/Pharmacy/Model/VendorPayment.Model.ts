import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VendorPaymentInstance, i.VendorPaymentAttributes> {
    let VendorPayment = sequelize.define<i.VendorPaymentInstance, i.VendorPaymentAttributes>('VendorPayment', {
        Id: { type: DataTypes.BIGINT, field: 'VendorPaymentId', primaryKey: true, autoIncrement: true },
        VendorPaymentIdentifier: { type: DataTypes.STRING, field: 'VendorPaymentIdentifier' },
        VendorPaymentDate: { type: DataTypes.DATE, field: 'VendorPaymentDate' },
        VendorPaymentStatusId: { type: DataTypes.INTEGER, field: 'VendorPaymentStatusId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        Address: { type: DataTypes.STRING, field: 'Address' },
        ContactNo: { type: DataTypes.STRING, field: 'ContactNo' },
        TotalInvoiceAmount: { type: DataTypes.DECIMAL, field: 'TotalInvoiceAmount' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        TotalPaidAmount: { type: DataTypes.DECIMAL, field: 'TotalPaidAmount' },
        TotalTDSAmount: { type: DataTypes.DECIMAL, field: 'TotalTDSAmount' },
        TotalOutstandingAmount: { type: DataTypes.DECIMAL, field: 'TotalOutstandingAmount' },
        WriteOff: { type: DataTypes.DECIMAL, field: 'WriteOff' },
        PaymentTypeId: { type: DataTypes.INTEGER, field: 'PaymentTypeId' },
        BankId: { type: DataTypes.INTEGER, field: 'BankId' },
        CardTypeId: { type: DataTypes.INTEGER, field: 'CardTypeId' },
        CardNumber: { type: DataTypes.STRING, field: 'CardNumber' },
        CardExpiryDate: { type: DataTypes.DATE, field: 'CardExpiryDate' },
        CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
        TerminalNoId: { type: DataTypes.STRING, field: 'TerminalNoId' },
        ChequeNo: { type: DataTypes.STRING, field: 'ChequeNo' },
        ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
        CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
        DDNumber: { type: DataTypes.INTEGER, field: 'DDNumber' },
        DDDate: { type: DataTypes.DATE, field: 'DDDate' },
        WireTransferId: { type: DataTypes.STRING, field: 'WireTransferId' },
        WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
        IsTDS: { type: DataTypes.BOOLEAN, field: 'IsTDS' },
        TDSId: { type: DataTypes.INTEGER, field: 'TDSId' },
        TSDPercentage: { type: DataTypes.STRING, field: 'TSDPercentage' },
        BeforeOutstanding: { type: DataTypes.DECIMAL, field: 'BeforeOutstanding' },
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
            tableName: 'vendorpayment',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VendorPayment as any).associate = function (models: Models) {
        VendorPayment.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        VendorPayment.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        VendorPayment.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });

        VendorPayment.belongsTo(models.ReferenceValue, {
            as: 'PaymentType', foreignKey: 'PaymentTypeId', targetKey: 'ReferenceValueCodeId'
        });
        VendorPayment.belongsTo(models.ReferenceValue, {
            as: 'VendorPaymentStatus', foreignKey: 'VendorPaymentStatusId', targetKey: 'ReferenceValueCodeId'
        });
        VendorPayment.hasMany(models.VendorPaymentDetails, { foreignKey: 'VendorPaymentId' });
        VendorPayment.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'UpdatedBy' });

    };
    return VendorPayment;
}
