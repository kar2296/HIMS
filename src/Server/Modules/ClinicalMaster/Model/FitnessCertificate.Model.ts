import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FitnessCertificateInstance, i.FitnessCertificateAttributes> {
    let FitnessCertificate = sequelize.define<i.FitnessCertificateInstance, i.FitnessCertificateAttributes>('FitnessCertificate', {
        Id: { type: DataTypes.BIGINT, field: 'MedicalFitnessId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        TemplateTypeId: { type: DataTypes.BIGINT, field: 'TemplateTypeId' },
        NoteTemplateId: { type: DataTypes.BIGINT, field: 'NoteTemplateId' },
        DataTemplate: { type: DataTypes.STRING, field: 'DataTemplate' },
        CertificateStatusId: { type: DataTypes.INTEGER, field: 'CertificateStatusId' },
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
            tableName: 'medicalfitness',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (FitnessCertificate as any).associate = function (models: Models) {
        FitnessCertificate.belongsTo(models.Patient);
        FitnessCertificate.belongsTo(models.NoteTemplate);
        FitnessCertificate.belongsTo(models.ReferenceValue, { as: 'CertificateStatus', targetKey: 'ReferenceValueCodeId' });
        FitnessCertificate.belongsTo(models.ReferenceValue, {
            as: 'NoteType',
            foreignKey: 'TemplateTypeId', targetKey: 'ReferenceValueCodeId'
        });
        FitnessCertificate.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        FitnessCertificate.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        FitnessCertificate.belongsTo(models.User, { as: 'UpdatedByUser', foreignKey: 'UpdatedBy' });
    };
    return FitnessCertificate;
}
