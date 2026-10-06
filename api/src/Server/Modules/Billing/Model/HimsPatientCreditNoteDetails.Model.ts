import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientCreditNoteDetailsInstance, i.PatientCreditNoteDetailsAttributes> {
    let PatientCreditNoteDetails = sequelize.define<i.PatientCreditNoteDetailsInstance, i.PatientCreditNoteDetailsAttributes>(
        'PatientCreditNoteDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientCreditNoteDetailId', primaryKey: true, autoIncrement: true },
            CreditNoteDetailDateTime: { type: DataTypes.DATE, field: 'CreditNoteDetailDateTime' },
            PatientCreditNoteId: { type: DataTypes.BIGINT, field: 'PatientCreditNoteId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
            ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
            ServiceAmount: { type: DataTypes.DOUBLE, field: 'ServiceAmount' },
            Discount: { type: DataTypes.DOUBLE, field: 'Discount' },
            CreditNoteTypeId: { type: DataTypes.BIGINT, field: 'CreditNoteTypeId' },
            NetAmount: { type: DataTypes.DOUBLE, field: 'NetAmount' },
            CreditNoteAmount: { type: DataTypes.DOUBLE, field: 'CreditNoteAmount' },
            DepartmentID: { type: DataTypes.BIGINT, field: 'DepartmentID' },
            PaymentcounterID: { type: DataTypes.BIGINT, field: 'PaymentcounterID' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
            PharmacyReturnId: { type: DataTypes.BIGINT, field: 'PharmacyReturnId' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
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
            tableName: 'patientcreditnotedetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientCreditNoteDetails as any).associate = function(models: Models) {
                    PatientCreditNoteDetails.belongsTo(models.ServiceItem, { foreignKey: 'ServiceId' });
                    PatientCreditNoteDetails.belongsTo(models.ReferenceValue, { as: 'CreditNoteType', targetKey: 'ReferenceValueCodeId' });
                };
 return PatientCreditNoteDetails;
}
