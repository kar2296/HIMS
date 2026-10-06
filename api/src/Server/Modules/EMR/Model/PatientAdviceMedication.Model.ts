import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientAdviceMedicationInstance, i.PatientAdviceMedicationAttributes> {
    let PatientAdviceMedication = sequelize.define<i.PatientAdviceMedicationInstance, i.
        PatientAdviceMedicationAttributes>('PatientAdviceMedication', {
            Id: { type: DataTypes.BIGINT, field: 'AdviseMedicationId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
            DrugName: { type: DataTypes.STRING, field: 'DrugName' },
            IsFreeText: { type: DataTypes.BOOLEAN, field: 'IsFreeText' },
            Dosage: { type: DataTypes.STRING, field: 'Dosage' },
            MorningFrequency: { type: DataTypes.BOOLEAN, field: 'MorningFrequency' },
            AfterNoonFrequency: { type: DataTypes.BOOLEAN, field: 'AfterNoonFrequency' },
            EveningFrequency: { type: DataTypes.BOOLEAN, field: 'EveningFrequency' },
            NightFrequency: { type: DataTypes.BOOLEAN, field: 'NightFrequency' },
            Duration: { type: DataTypes.STRING, field: 'Duration' },
            DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
            DrugInstructionId: { type: DataTypes.BIGINT, field: 'DrugInstructionId' },
            DietAdvice: { type: DataTypes.STRING, field: 'DietAdvice' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            FrequencyFreeText: { type: DataTypes.STRING, field: 'FrequencyFreeText' },
            Notes: { type: DataTypes.STRING, field: 'Notes' },
            Route: { type: DataTypes.STRING, field: 'Route' },
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
            tableName: 'patientadvicemedications',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientAdviceMedication as any).associate = function (models: Models) {
        PatientAdviceMedication.belongsTo(models.ReferenceValue, { as: 'DurationPeriod', targetKey: 'ReferenceValueCodeId' });
        PatientAdviceMedication.belongsTo(models.ReferenceValue, { as: 'DrugInstruction', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientAdviceMedication;
}
