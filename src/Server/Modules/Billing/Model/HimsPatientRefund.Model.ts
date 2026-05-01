import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientRefundInstance, i.PatientRefundAttributes> {
    let PatientRefund =
        sequelize.define<i.PatientRefundInstance, i.PatientRefundAttributes>('PatientRefund', {
            Id: { type: DataTypes.BIGINT, field: 'PatientRefundId', primaryKey: true, autoIncrement: true },
            RefundDateTime: { type: DataTypes.DATE, field: 'RefundDateTime' },
            RefundIdentifier: { type: DataTypes.STRING, field: 'RefundIdentifier' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            RefundTypeId: { type: DataTypes.BIGINT, field: 'RefundTypeId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            PatientReceiptId: { type: DataTypes.BIGINT, field: 'PatientReceiptId' },
            RefundAmount: { type: DataTypes.DOUBLE, field: 'RefundAmount' },
            DepartmentID: { type: DataTypes.BIGINT, field: 'DepartmentID' },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            PaymentcounterID: { type: DataTypes.BIGINT, field: 'PaymentcounterID' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            RefundGeneratedById: { type: DataTypes.BIGINT, field: 'RefundGeneratedById' },
            RefundApprovedById: { type: DataTypes.BIGINT, field: 'RefundApprovedById' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            PharmacyReturnId: { type: DataTypes.BIGINT, field: 'PharmacyReturnId' },
            CardNumber: { type: DataTypes.BIGINT, field: 'CardNumber' },
            CardDateTime: { type: DataTypes.DATE, field: 'CardDateTime' },
            CardExpiryDate: { type: DataTypes.DATE, field: 'CardExpiryDate' },
            BankId: { type: DataTypes.INTEGER, field: 'BankId' },
            CardTypeId: { type: DataTypes.INTEGER, field: 'CardTypeId' },
            TerminalNoId: { type: DataTypes.INTEGER, field: 'TerminalNoId' },
            CardHolderName: { type: DataTypes.STRING, field: 'CardHolderName' },
            AuthorizeNumber: { type: DataTypes.INTEGER, field: 'AuthorizeNumber' },
            GurantorName: { type: DataTypes.STRING, field: 'GurantorName' },
            ChequeNo: { type: DataTypes.INTEGER, field: 'ChequeNo' },
            ChequeDate: { type: DataTypes.DATE, field: 'ChequeDate' },
            DDNumber: { type: DataTypes.INTEGER, field: 'DDNumber' },
            DDDate: { type: DataTypes.DATE, field: 'DDDate' },
            WireTransferId: { type: DataTypes.INTEGER, field: 'WireTransferId' },
            WireTransferDate: { type: DataTypes.DATE, field: 'WireTransferDate' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            IsCashToCredit: { type: DataTypes.BOOLEAN, field: 'IsCashToCredit' },
            CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
            RefundStatusId: { type: DataTypes.INTEGER, field: 'RefundStatusId' },
            RefundApprovalStatusId: { type: DataTypes.INTEGER, field: 'RefundApprovalStatusId' },
            RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
            PatientReturnId: { type: DataTypes.INTEGER, field: 'PatientReturnId' },
            DebitNoteId: { type: DataTypes.INTEGER, field: 'DebitNoteId' },
            PaymentTypeId: { type: DataTypes.BIGINT, field: 'PaymentTypeId' },
            PatientCreditNoteId: { type: DataTypes.BIGINT, field: 'PatientCreditNoteId' },
            RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
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
                tableName: 'patientrefund',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientRefund as any).associate = function (models: Models) {
        PatientRefund.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PatientRefund.belongsTo(models.PatientCreditNote, { foreignKey: 'PatientCreditNoteId' });
        PatientRefund.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientRefund.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientRefund.belongsTo(models.User, { as: 'RefundUser', foreignKey: 'RefundGeneratedById' });
        PatientRefund.belongsTo(models.Department, { foreignKey: 'DepartmentID' });
        PatientRefund.belongsTo(models.ReferenceValue, { as: 'RefundType', targetKey: 'ReferenceValueCodeId' });
        PatientRefund.belongsTo(models.ReferenceValue, { as: 'RefundStatus', targetKey: 'ReferenceValueCodeId' });
        PatientRefund.belongsTo(models.ReferenceValue, { as: 'RefundApprovalStatus', targetKey: 'ReferenceValueCodeId' });
        PatientRefund.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientRefund.belongsTo(models.Patient);
        PatientRefund.belongsTo(models.ReferenceValue, { as: 'PaymentType', targetKey: 'ReferenceValueCodeId' });
        PatientRefund.belongsTo(models.ReferenceValue, { as: 'Bank', targetKey: 'ReferenceValueCodeId' });
        PatientRefund.belongsTo(models.PatientPaymentDetails, { foreignKey: 'PatientReceiptId' });
        PatientRefund.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        PatientRefund.belongsTo(models.PatientBills, { as: 'PharmacyDetails', foreignKey: 'PatientBillId' });
        PatientRefund.belongsTo(models.PatientReturns, { foreignKey: 'PatientReturnId' });
        PatientRefund.hasMany(models.PatientRefundDetails);
    };
    return PatientRefund;
}
