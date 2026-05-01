import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientNotifiableDiseaseInstance, i.PatientNotifiableDiseaseAttributes> {
    let PatientNotifiableDisease = sequelize.define<i.PatientNotifiableDiseaseInstance, i.
        PatientNotifiableDiseaseAttributes>('PatientNotifiableDisease', {
            Id: { type: DataTypes.BIGINT, field: 'PatientNotifiableDiseaseId', primaryKey: true, autoIncrement: true },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            NotifiableDiseaseTypeId: { type: DataTypes.BIGINT, field: 'NotifiableDiseaseTypeId' },
            NotifiableDiseaseId: { type: DataTypes.BIGINT, field: 'NotifiableDiseaseId' },
            NotifiableDiseaseName: { type: DataTypes.STRING, field: 'NotifiableDiseaseName' },
            Notes: { type: DataTypes.STRING, field: 'Notes' },
            PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
                tableName: 'patientnotifydiseases',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientNotifiableDisease as any).associate = function (models: Models) {
        PatientNotifiableDisease.belongsTo(models.Encounter);
        PatientNotifiableDisease.belongsTo(models.Patient);
        PatientNotifiableDisease.belongsTo(models.ReferenceValue, { as: 'NotifiableDiseaseType', targetKey: 'ReferenceValueCodeId' });
        PatientNotifiableDisease.belongsTo(models.ReferenceValue, { as: 'NotifiableDisease', targetKey: 'ReferenceValueCodeId' });
        PatientNotifiableDisease.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
    };
    return PatientNotifiableDisease;
}
