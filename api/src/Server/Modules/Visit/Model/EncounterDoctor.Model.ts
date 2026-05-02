import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EncounterDoctorInstance, i.EncounterDoctorAttributes> {
    let EncounterDoctor = sequelize.define<i.EncounterDoctorInstance, i.EncounterDoctorAttributes>('EncounterDoctor', {
        Id: { type: DataTypes.BIGINT, field: 'EncounterDoctorId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterConsulationId: { type: DataTypes.BIGINT, field: 'EncounterConsulationId' },
        AppointmentId: { type: DataTypes.BIGINT, field: 'AppointmentId' },
        VisitIdentifier: { type: DataTypes.STRING, field: 'VisitIdentifier' },
        ConsultationNumber: { type: DataTypes.STRING, field: 'ConsultationNumber' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        EndDate: { type: DataTypes.DATE, field: 'EndDate' },
        TokenNumber: { type: DataTypes.STRING, field: 'TokenNumber' },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        TransferedById: { type: DataTypes.BIGINT, field: 'TransferedById' },
        ClinicalStaffId: { type: DataTypes.BIGINT, field: 'ClinicalStaffId' },
        AdmitReason: { type: DataTypes.STRING, field: 'AdmitReason' },
        IsPrimary: { type: DataTypes.BOOLEAN, field: 'IsPrimary' },
        IsVirtualConsultation: { type: DataTypes.BOOLEAN, field: 'IsVirtualConsultation' },
        EncounterDoctorStatus: { type: DataTypes.INTEGER, field: 'EncounterDoctorStatus' },
        VirtualCategoryId: { type: DataTypes.BIGINT, field: 'VirtualCategoryId' },
        VirtualOrderId: { type: DataTypes.BIGINT, field: 'VirtualOrderId' },
        IsEmergencyVisit: { type: DataTypes.BOOLEAN, field: 'IsEmergencyVisit' },
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
            tableName: 'encounterdoctors',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (EncounterDoctor as any).associate = function (models: Models) {
        EncounterDoctor.belongsTo(models.Patient);
        EncounterDoctor.belongsTo(models.Encounter);
        EncounterDoctor.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        EncounterDoctor.belongsTo(models.Department);
        EncounterDoctor.belongsTo(models.Appointment);
        EncounterDoctor.belongsTo(models.VirtualOrder);
        EncounterDoctor.belongsTo(models.ReferenceValue,
            { as: 'ConsultationStatus', foreignKey: 'EncounterDoctorStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return EncounterDoctor;
}
