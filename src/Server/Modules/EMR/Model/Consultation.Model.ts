import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ConsultationInstance, i.ConsultationAttributes> {
    let Consultation = sequelize.define<i.ConsultationInstance, i.ConsultationAttributes>('Consultation', {
        Id: { type: DataTypes.BIGINT, field: 'ConsultationId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterDoctorId: { type: DataTypes.BIGINT, field: 'EncounterDoctorId' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        ProfileId: { type: DataTypes.BIGINT, field: 'ProfileId' },
        ProgressNoteStatusId: { type: DataTypes.BIGINT, field: 'ProgressNoteStatusId' },
        VisitTypeId: { type: DataTypes.BIGINT, field: 'VisitTypeId' },
        ReferenceNo: { type: DataTypes.STRING, field: 'ReferenceNo' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DischargeTypeId: { type: DataTypes.BIGINT, field: 'DischargeTypeId' },
        AdmissionDate: { type: DataTypes.DATE, field: 'AdmissionDate' },
        DischargeDate: { type: DataTypes.DATE, field: 'DischargeDate' },
        SurgeryDate: { type: DataTypes.DATE, field: 'SurgeryDate' },
        IsIVF: { type: DataTypes.BOOLEAN, field: 'IsIVF' },
        Doctor: { type: DataTypes.INTEGER, field: 'Doctor' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'consultations',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Consultation as any).associate = function (models: Models) {
        Consultation.belongsTo(models.ProfileMaster, { foreignKey: 'ProfileId' });
        Consultation.belongsTo(models.Encounter);
        Consultation.belongsTo(models.Patient);
        Consultation.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        Consultation.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        Consultation.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        Consultation.belongsTo(models.User, { as: 'Doc', foreignKey: 'EncounterDoctorId' });
        Consultation.belongsTo(models.ReferenceValue, { as: 'ProgressNoteStatus', targetKey: 'ReferenceValueCodeId' });
        Consultation.belongsTo(models.ReferenceValue, { as: 'VisitType', targetKey: 'ReferenceValueCodeId' });
        Consultation.belongsTo(models.ReferenceValue, { as: 'DischargeType', targetKey: 'ReferenceValueCodeId' });
    };
    return Consultation;
}
