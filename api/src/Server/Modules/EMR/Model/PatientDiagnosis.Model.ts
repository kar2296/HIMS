import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDiagnosisInstance, i.PatientDiagnosisAttributes> {
    let PatientDiagnosis = sequelize.define<i.PatientDiagnosisInstance, i.PatientDiagnosisAttributes>('PatientDiagnosis', {
        Id: { type: DataTypes.BIGINT, field: 'PatientDiagnosisId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        DiagnosisTypeId: { type: DataTypes.BIGINT, field: 'DiagnosisTypeId' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        DiagnosisName: { type: DataTypes.STRING, field: 'DiagnosisName' },
        OtherDiagnosisName: { type: DataTypes.STRING, field: 'OtherDiagnosisName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        Date: { type: DataTypes.DATE, field: 'Date' },
        DiagnosisStatusId: { type: DataTypes.BIGINT, field: 'DiagnosisStatusId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        DOA: { type: DataTypes.DATE, field: 'DOA' },
        DOD: { type: DataTypes.DATE, field: 'DOD' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        ConditionTypeId: { type: DataTypes.BIGINT, field: 'ConditionTypeId' },
        ConditionStatusId: { type: DataTypes.BIGINT, field: 'ConditionStatusId' },
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
            tableName: 'patientdiagnosis',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {Status:1}
            }
        });

     (PatientDiagnosis as any).associate = function(models: Models) {
                    PatientDiagnosis.belongsTo(models.ReferenceValue, { as: 'ConditionType', targetKey: 'ReferenceValueCodeId' });
                    PatientDiagnosis.belongsTo(models.ReferenceValue, { as: 'ConditionStatus', targetKey: 'ReferenceValueCodeId' });
                    PatientDiagnosis.belongsTo(models.Diagnosis);
                };
 return PatientDiagnosis;
}
