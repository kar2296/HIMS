import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ModifiedPatientPaymentDetailsInstance, i.ModifiedPatientPaymentDetailsAttributes> {
    let ModifiedPatientPaymentDetails =
        sequelize.define<i.ModifiedPatientPaymentDetailsInstance,
            i.ModifiedPatientPaymentDetailsAttributes>('ModifiedPatientPaymentDetails', {
                Id: { type: DataTypes.BIGINT, field: 'ModifiedPatientPaymentDetailId', primaryKey: true, autoIncrement: true },
                PatientReceiptId: { type: DataTypes.BIGINT, field: 'PatientReceiptId' },
                ReceiptDateTime: { type: DataTypes.DATE, field: 'ReceiptDateTime' },
                ReceiptNumber: { type: DataTypes.STRING, field: 'ReceiptNumber' },
                ReceiptTypeId: { type: DataTypes.BIGINT, field: 'ReceiptTypeId' },
                ReceiptStatusId: { type: DataTypes.BIGINT, field: 'ReceiptStatusId' },
                IsPharmacyReceipt: { type: DataTypes.BOOLEAN, field: 'IsPharmacyReceipt' },
                PharmacyReceiptTypeId: { type: DataTypes.BIGINT, field: 'PharmacyReceiptTypeId' },
                ReceiptGeneratedById: { type: DataTypes.BIGINT, field: 'ReceiptGeneratedById' },
                ReceiptApprovedById: { type: DataTypes.BIGINT, field: 'ReceiptApprovedById' },
                ModifiedPatientBillId: { type: DataTypes.BIGINT, field: 'ModifiedPatientBillId' },
                PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
                BillTypeId: { type: DataTypes.BIGINT, field: 'BillTypeId' },
                PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
                TransferPatientId: { type: DataTypes.BIGINT, field: 'TransferPatientId' },
                PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
                PatientName: { type: DataTypes.STRING, field: 'PatientName' },
                EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
                TransferEncounterId: { type: DataTypes.BIGINT, field: 'TransferEncounterId' },
                FamilyLinkId: { type: DataTypes.BIGINT, field: 'FamilyLinkId' },
                GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
                GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
                GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
                DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
                FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
                OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
                AmountPaid: { type: DataTypes.DOUBLE, field: 'AmountPaid' },
                AmountAdjusted: { type: DataTypes.DOUBLE, field: 'AmountAdjusted' },
                TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
                DisAllowance: { type: DataTypes.DECIMAL, field: 'DisAllowance' },
                RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
                PaymentCounterId: { type: DataTypes.BIGINT, field: 'PaymentCounterId' },
                PaymentTypeId: { type: DataTypes.BIGINT, field: 'PaymentTypeId' },
                PaymentStatusId: { type: DataTypes.BIGINT, field: 'PaymentStatusId' },
                CurrencyTypeId: { type: DataTypes.BIGINT, field: 'CurrencyTypeId' },
                IsConsolidatePay: { type: DataTypes.BOOLEAN, field: 'IsConsolidatePay' },
                IsClaimed: { type: DataTypes.BOOLEAN, field: 'IsClaimed' },
                TerminalNoId: { type: DataTypes.BIGINT, field: 'TerminalNoId' },
                BankId: { type: DataTypes.BIGINT, field: 'BankId' },
                CardTypeId: { type: DataTypes.BIGINT, field: 'CardTypeId' },
                CardNumber: { type: DataTypes.STRING, field: 'CardNumber' },
                CardExpiryDate: { type: DataTypes.DATE, field: 'CardExpiryDate' },
                CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
                AuthorizeNumber: { type: DataTypes.BIGINT, field: 'AuthorizeNumber' },
                AuthorizedCode: { type: DataTypes.STRING, field: 'AuthorizedCode' },
                ChequeNo: { type: DataTypes.STRING, field: 'ChequeNo' },
                ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
                CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
                DDNumber: { type: DataTypes.STRING, field: 'DDNumber' },
                DDDate: { type: DataTypes.DATE, field: 'DDDate' },
                WireTransferId: { type: DataTypes.BIGINT, field: 'WireTransferId' },
                WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
                Comments: { type: DataTypes.STRING, field: 'Comments' },
                CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
                Status: { type: DataTypes.INTEGER, field: 'Status' },
                Rev: { type: DataTypes.INTEGER, field: 'Rev' },
                CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
                CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
                UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
                UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            },
                {
                    indexes: [], timestamps: true,
                    tableName: 'modifiedpatientpaymentdetails',
                    createdAt: 'CreatedAt',
                    updatedAt: 'UpdatedAt',
                    freezeTableName: true,
                    defaultScope: {
                        where: {
                            Status: 1
                        }
                    }
                });

    (ModifiedPatientPaymentDetails as any).associate = function (models: Models) {
        ModifiedPatientPaymentDetails.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        ModifiedPatientPaymentDetails.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        ModifiedPatientPaymentDetails.belongsTo(models.Patient);
        ModifiedPatientPaymentDetails.belongsTo(models.ReferenceValue, { as: 'ReceiptStatus', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientPaymentDetails.belongsTo(models.ReferenceValue, { as: 'PaymentType', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientPaymentDetails.belongsTo(models.ReferenceValue, { as: 'CardType', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientPaymentDetails.belongsTo(models.ReferenceValue, { as: 'Bank', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientPaymentDetails.belongsTo(models.ReferenceValue, { as: 'ReceiptType', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientPaymentDetails.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        ModifiedPatientPaymentDetails.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        ModifiedPatientPaymentDetails.belongsTo(models.ModifiedPatientBills, { foreignKey: 'ModifiedPatientBillId' });
        ModifiedPatientPaymentDetails.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        ModifiedPatientPaymentDetails.belongsTo(models.PatientGuarantor, { foreignKey: 'GuarantorId' });
    };
    return ModifiedPatientPaymentDetails;
}
