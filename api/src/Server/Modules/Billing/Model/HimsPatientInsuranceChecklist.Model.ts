import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientInsuranceChecklistInstance, i.PatientInsuranceChecklistAttributes> {
    let PatientInsuranceChecklist = sequelize.define<i.PatientInsuranceChecklistInstance, i.PatientInsuranceChecklistAttributes>(
        'PatientInsuranceChecklist', {
            Id: { type: DataTypes.BIGINT, field: 'patientInsuranceChecklistId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            ChecklistId: { type: DataTypes.BIGINT, field: 'ChecklistId' },
            ChecklistStatusId: { type: DataTypes.BIGINT, field: 'ChecklistStatusId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
        },
        {
            indexes: [],
            timestamps: true,
            tableName: 'PatientInsuranceChecklist',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientInsuranceChecklist as any).associate = function(models: Models) {
                    PatientInsuranceChecklist.belongsTo(models.GuarantorChecklist, { foreignKey: 'ChecklistId' });
                };
 return PatientInsuranceChecklist;
}
