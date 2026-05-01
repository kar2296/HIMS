import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientPaymentAdjustmentsInstance, i.PatientPaymentAdjustmentsAttributes> {
    let PatientPaymentAdjustments =
        sequelize.define<i.PatientPaymentAdjustmentsInstance, i.PatientPaymentAdjustmentsAttributes>('PatientPaymentAdjustments', {
            Id: { type: DataTypes.BIGINT, field: 'PaymentAdjustId', primaryKey: true, autoIncrement: true },
            ParentReceiptId: { type: DataTypes.BIGINT, field: 'ParentReceiptId' },
            PatientReceiptId: { type: DataTypes.BIGINT, field: 'PatientReceiptId' },
            AdjustedDateTime: { type: DataTypes.DATE, field: 'AdjustedDateTime' },
            PaymentAdjustNumber: { type: DataTypes.STRING, field: 'PaymentAdjustNumber' },
            AvailedAdvance: { type: DataTypes.DOUBLE, field: 'AvailedAdvance' },
            AdvanceAdjusted: { type: DataTypes.DOUBLE, field: 'AdvanceAdjusted' },
            BalanceAdvance: { type: DataTypes.DOUBLE, field: 'BalanceAdvance' },
            RoundOffValue: { type: DataTypes.DOUBLE, field: 'RoundOffValue' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            BillTypeId: { type: DataTypes.INTEGER, field: 'BillTypeId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            AdjustedById: { type: DataTypes.BIGINT, field: 'AdjustedById' },
            ApprovedById: { type: DataTypes.BIGINT, field: 'ApprovedById' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [], timestamps: true,
                tableName: 'patientpaymentadjustments',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientPaymentAdjustments as any).associate = function (models: Models) {
        // PatientPaymentAdjustments.belongsTo(models.User, { foreignKey: 'CreatedBy' });
        PatientPaymentAdjustments.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        PatientPaymentAdjustments.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientPaymentAdjustments.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientPaymentAdjustments.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        PatientPaymentAdjustments.belongsTo(models.PatientPaymentDetails, { as: 'AdvanceDetail', foreignKey: 'ParentReceiptId' });
        PatientPaymentAdjustments.belongsTo(models.PatientPaymentDetails, { as: 'BillingDetail', foreignKey: 'PatientReceiptId' });
    };
    return PatientPaymentAdjustments;
}
