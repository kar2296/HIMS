import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OPModifyPatPaymentDetailsInstance, i.OPModifyPatPaymentDetailsAttributes> {
    let OPModifyPatPaymentDetails =
        sequelize.define<i.OPModifyPatPaymentDetailsInstance, i.OPModifyPatPaymentDetailsAttributes>('OPModifyPatPaymentDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientReceiptId', primaryKey: true },
            ReceiptDateTime: { type: DataTypes.DATE, field: 'ReceiptDateTime' },
            ReceiptNumber: { type: DataTypes.STRING, field: 'ReceiptNumber' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            ReceiptTypeId: { type: DataTypes.BIGINT, field: 'ReceiptTypeId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            OutStandingAmount: { type: DataTypes.DOUBLE, field: 'OutStandingAmount' },
            AmountPaid: { type: DataTypes.DOUBLE, field: 'AmountPaid' },
            AmountAdjusted: { type: DataTypes.DOUBLE, field: 'AmountAdjusted' },
            RefundAmount: { type: DataTypes.DOUBLE, field: 'RefundAmount' },
            DueAmount: { type: DataTypes.DOUBLE, field: 'DueAmount' },
            DepartmentID: { type: DataTypes.BIGINT, field: 'DepartmentID' },
            PaymentcounterID: { type: DataTypes.BIGINT, field: 'PaymentcounterID' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            FamilyLinkId: { type: DataTypes.BIGINT, field: 'FamilyLinkId' },
            TransferEncounterId: { type: DataTypes.BIGINT, field: 'TransferEncounterId' },
            TransferPatientId: { type: DataTypes.BIGINT, field: 'TransferPatientId' },
            ReceiptGeneratedById: { type: DataTypes.BIGINT, field: 'ReceiptGeneratedById' },
            ReceiptApprovedById: { type: DataTypes.BIGINT, field: 'ReceiptApprovedById' },
            PaymentTypeId: { type: DataTypes.BIGINT, field: 'PaymentTypeId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
            ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            BillTypeId: { type: DataTypes.INTEGER, field: 'BillTypeId' },
            IsPharmacyReceipt: { type: DataTypes.BOOLEAN, field: 'IsPharmacyReceipt' },
            IsConsolidatePay: { type: DataTypes.BOOLEAN, field: 'IsConsolidatePay' },
            IsPharmacyClearance: { type: DataTypes.BOOLEAN, field: 'IsPharmacyClearance' },
            IsClaimed: { type: DataTypes.BOOLEAN, field: 'IsClaimed' },
            IsClaimReceipt: { type: DataTypes.BOOLEAN, field: 'IsClaimReceipt' },
            PharmacyReceiptTypeId: { type: DataTypes.INTEGER, field: 'PharmacyReceiptTypeId' },
            CardNumber: { type: DataTypes.BIGINT, field: 'CardNumber' },
            CardDateTime: { type: DataTypes.DATE, field: 'CardDateTime' },
            CardExpiryDate: { type: DataTypes.DATE, field: 'CardExpiryDate' },
            BankId: { type: DataTypes.INTEGER, field: 'BankId' },
            CardTypeId: { type: DataTypes.INTEGER, field: 'CardTypeId' },
            TerminalNoId: { type: DataTypes.INTEGER, field: 'TerminalNoId' },
            CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
            AuthorizeNumber: { type: DataTypes.INTEGER, field: 'AuthorizeNumber' },
            AuthorizedCode: { type: DataTypes.STRING, field: 'AuthorizedCode' },
            GurantorName: { type: DataTypes.STRING, field: 'GurantorName' },
            ChequeNo: { type: DataTypes.INTEGER, field: 'ChequeNo' },
            ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
            CollectedOn: { type: DataTypes.DATE, field: 'CollectedOn' },
            DDNumber: { type: DataTypes.INTEGER, field: 'DDNumber' },
            DDDate: { type: DataTypes.DATE, field: 'DDDate' },
            WireTransferId: { type: DataTypes.INTEGER, field: 'WireTransferId' },
            WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
            ReceiptStatusId: { type: DataTypes.INTEGER, field: 'ReceiptStatusId' },
            TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
            Disallowance: { type: DataTypes.DECIMAL, field: 'Disallowance' },
            RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
            CreditNoteId: { type: DataTypes.INTEGER, field: 'CreditNoteId' },
            CurrencyTypeId: { type: DataTypes.INTEGER, field: 'CurrencyTypeId' },
            PaymentStatusId: { type: DataTypes.INTEGER, field: 'PaymentStatusId' },
            AdjustmentReceiptId: { type: DataTypes.BIGINT, field: 'AdjustmentReceiptId' },
            IsAdjustmentReceipt: { type: DataTypes.BOOLEAN, field: 'IsAdjustmentReceipt' },
            IsMultiplePayment: { type: DataTypes.BOOLEAN, field: 'IsMultiplePayment' },
            UPIRefNumber: { type: DataTypes.STRING, field: 'UPIRefNumber' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            PayModeHistory: { type: DataTypes.TEXT, field: 'PayModeHistory' },
            StoreMasterId: { type: DataTypes.INTEGER, field: 'StoreMasterId' },
            ReferenceNumber: { type: DataTypes.STRING, field: 'ReferenceNumber' },
            ErpTransactionId: { type: DataTypes.STRING, field: 'ErpTransactionId' },
        },
            {
                indexes: [], timestamps: true,
                tableName: 'opmodifypatpaymentdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (OPModifyPatPaymentDetails as any).associate = function (models: Models) {
        OPModifyPatPaymentDetails.belongsTo(models.User, { foreignKey: 'DoctorId' });
        OPModifyPatPaymentDetails.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        OPModifyPatPaymentDetails.belongsTo(models.Department, { foreignKey: 'DepartmentID' });
        OPModifyPatPaymentDetails.belongsTo(models.Patient);
        OPModifyPatPaymentDetails.belongsTo(models.ReferenceValue, { as: 'ReceiptStatus', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatPaymentDetails.belongsTo(models.ReferenceValue, { as: 'PaymentType', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatPaymentDetails.belongsTo(models.ReferenceValue, { as: 'CardType', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatPaymentDetails.belongsTo(models.ReferenceValue, { as: 'Bank', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatPaymentDetails.belongsTo(models.ReferenceValue, { as: 'ReceiptType', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatPaymentDetails.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        OPModifyPatPaymentDetails.belongsTo(models.ReferenceValue, { as: 'GuarantorType', targetKey: 'ReferenceValueCodeId' });
        OPModifyPatPaymentDetails.belongsTo(models.OPModifyPatBills, { foreignKey: 'PatientBillId' });
        OPModifyPatPaymentDetails.belongsTo(models.PatientGuarantor, { foreignKey: 'GuarantorId' });
    };
    return OPModifyPatPaymentDetails;
}
