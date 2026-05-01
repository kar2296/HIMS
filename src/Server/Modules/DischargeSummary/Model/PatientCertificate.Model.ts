import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientCertificateInstance, i.PatientCertificateAttributes> {
    let PatientCertificate = sequelize.define<i.PatientCertificateInstance, i.PatientCertificateAttributes>('PatientCertificate', {
        Id: { type: DataTypes.BIGINT, field: 'PatientCertificateId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        AdmissionDate: { type: DataTypes.DATE, field: 'AdmissionDate' },
        DischargeDate: { type: DataTypes.DATE, field: 'DischargeDate' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        DataTemplate: { type: DataTypes.TEXT, field: 'DataTemplate' },
        SurgeryDate: { type: DataTypes.DATE, field: 'SurgeryDate' },
        TemplateTypeId: { type: DataTypes.BIGINT, field: 'TemplateTypeId' },
        NoteTypeId: { type: DataTypes.BIGINT, field: 'NoteTypeId' },
        NoteTemplateId: { type: DataTypes.BIGINT, field: 'NoteTemplateId' },
        DischargeTypeId: { type: DataTypes.BIGINT, field: 'DischargeTypeId' },
        CertificateStatusId: { type: DataTypes.BIGINT, field: 'CertificateStatusId' },
        ReleasedToPatient: { type: DataTypes.INTEGER, field: 'ReleasedToPatient' },
        AdmissionStatusId: { type: DataTypes.BIGINT, field: 'AdmissionStatusId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        VisitIdentifier: { type: DataTypes.STRING, field: 'VisitIdentifier' },
        ReleasedOn: { type: DataTypes.DATE, field: 'ReleasedOn' },
        ReleasedBy: { type: DataTypes.INTEGER, field: 'ReleasedBy' },
        ApprovedOn: { type: DataTypes.DATE, field: 'ApprovedOn' },
        AprovedBy: { type: DataTypes.INTEGER, field: 'AprovedBy' },
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
            tableName: 'patientcertificates',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientCertificate as any).associate = function (models: Models) {
        PatientCertificate.belongsTo(models.ReferenceValue, { as: 'AdmissionStatus', targetKey: 'ReferenceValueCodeId' });
        PatientCertificate.belongsTo(models.ReferenceValue, { as: 'CertificateStatus', targetKey: 'ReferenceValueCodeId' });
        PatientCertificate.belongsTo(models.ReferenceValue, { as: 'NoteType', targetKey: 'ReferenceValueCodeId' });
        PatientCertificate.belongsTo(models.ReferenceValue, { as: 'DischargeType', targetKey: 'ReferenceValueCodeId' });
        PatientCertificate.belongsTo(models.Patient);
        PatientCertificate.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        PatientCertificate.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientCertificate.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        PatientCertificate.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        PatientCertificate.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        PatientCertificate.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        PatientCertificate.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientCertificate.belongsTo(models.User, { as: 'AprovedUser', foreignKey: 'AprovedBy' });
        PatientCertificate.belongsTo(models.User, { as: 'UpdatedByUser', foreignKey: 'UpdatedBy' });
        PatientCertificate.belongsTo(models.Department);
        //PatientCertificate.belongsTo(models.Ward, { foreignKey: 'WardId' });
        //PatientCertificate.belongsTo(models.Room, { foreignKey: 'RoomId' });
    };
    return PatientCertificate;
}
