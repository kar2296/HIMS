import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientConditionInstance, i.PatientConditionAttributes> {
    let PatientCondition = sequelize.define<i.PatientConditionInstance, i.PatientConditionAttributes>('PatientCondition', {
        Id: { type: DataTypes.BIGINT, field: 'PatientConditiond', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        ConditionTypeId: { type: DataTypes.BIGINT, field: 'ConditionTypeId' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        DiagnosisName: { type: DataTypes.STRING, field: 'DiagnosisName' },
        OtherDiagnosis: { type: DataTypes.STRING, field: 'OtherDiagnosis' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ConditionDate: { type: DataTypes.DATE, field: 'ConditionDate' },
        ConditionStatusId: { type: DataTypes.BIGINT, field: 'ConditionStatusId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
        IsPatientCondition: { type: DataTypes.BOOLEAN, field: 'IsPatientCondition' },
        BodySite: { type: DataTypes.STRING, field: 'BodySite' },
        SideId: { type: DataTypes.BIGINT, field: 'SideId' },
        TestMasterPositionId: { type: DataTypes.BIGINT, field: 'TestMasterPositionId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        TypeId: { type: DataTypes.BIGINT, field: 'TypeId' },
        GradeId: { type: DataTypes.BIGINT, field: 'GradeId' },
        DiagnosisDetails: { type: DataTypes.STRING, field: 'DiagnosisDetails' },
        IsSNOMED: { type: DataTypes.BOOLEAN, field: 'IsSNOMED' },
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
            tableName: 'patientconditions',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientCondition as any).associate = function (models: Models) {
        PatientCondition.belongsTo(models.Encounter);
        PatientCondition.belongsTo(models.ReferenceValue, { as: 'ConditionType', targetKey: 'ReferenceValueCodeId' });
        PatientCondition.belongsTo(models.ReferenceValue, { as: 'ConditionStatus', targetKey: 'ReferenceValueCodeId' });
        PatientCondition.belongsTo(models.ReferenceValue, { as: 'Side', targetKey: 'ReferenceValueCodeId' });

    };
    return PatientCondition;
}
