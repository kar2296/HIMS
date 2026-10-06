import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientCreditNoteInstance, i.PatientCreditNoteAttributes> {
    let PatientCreditNote = sequelize.define<i.PatientCreditNoteInstance, i.PatientCreditNoteAttributes>('PatientCreditNote', {
        Id: { type: DataTypes.BIGINT, field: 'PatientCreditNoteId', primaryKey: true, autoIncrement: true },
        CreditNoteDateTime: { type: DataTypes.DATE, field: 'CreditNoteDateTime' },
        CreditNoteIdentifier: { type: DataTypes.STRING, field: 'CreditNoteIdentifier' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        CreditNoteTypeId: { type: DataTypes.BIGINT, field: 'CreditNoteTypeId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        PatientReceiptId: { type: DataTypes.BIGINT, field: 'PatientReceiptId' },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        CreditNoteAmount: { type: DataTypes.DOUBLE, field: 'CreditNoteAmount' },
        DepartmentID: { type: DataTypes.BIGINT, field: 'DepartmentID' },
        PaymentcounterID: { type: DataTypes.BIGINT, field: 'PaymentcounterID' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        RefundGeneratedById: { type: DataTypes.BIGINT, field: 'RefundGeneratedById' },
        CreditNoteApprovedById: { type: DataTypes.BIGINT, field: 'CreditNoteApprovedById' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
        CreditNoteStatusId: { type: DataTypes.INTEGER, field: 'CreditNoteStatusId' },
        AdjustedAmount: { type: DataTypes.BIGINT, field: 'AdjustedAmount' },
        RoundOffValue: { type: DataTypes.BIGINT, field: 'RoundOffValue' },
        DebitNoteId: { type: DataTypes.INTEGER, field: 'DebitNoteId' },
        PaymentTypeId: { type: DataTypes.INTEGER, field: 'PaymentTypeId' },
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
            tableName: 'patientcreditnote',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientCreditNote as any).associate = function(models: Models) {
                    PatientCreditNote.belongsTo(models.Patient);
                    PatientCreditNote.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
                    PatientCreditNote.belongsTo(models.ReferenceValue, { as: 'CreditNoteType', targetKey: 'ReferenceValueCodeId' });
                    PatientCreditNote.belongsTo(models.ReferenceValue, { as: 'CreditNoteStatus', targetKey: 'ReferenceValueCodeId' });
                    PatientCreditNote.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
                    PatientCreditNote.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'CreditNoteApprovedById' });
                    PatientCreditNote.hasMany(models.PatientCreditNoteDetails);
                };
 return PatientCreditNote;
}
