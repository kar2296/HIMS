import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SurgeryEntryInstance, i.SurgeryEntryAttributes> {
    let SurgeryEntry = sequelize.define<i.SurgeryEntryInstance, i.SurgeryEntryAttributes>('SurgeryEntry', {
        Id: { type: DataTypes.BIGINT, field: 'SurgeryEntryId', primaryKey: true, autoIncrement: true },
        SurgeryIdentifier: { type: DataTypes.STRING, field: 'SurgeryIdentifier' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        SurgeryRegisteredOn: { type: DataTypes.DATE, field: 'SurgeryRegisteredOn' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        SurgeryScheduleId: { type: DataTypes.BIGINT, field: 'SurgeryScheduleId' },
        SurgeryRequestId: { type: DataTypes.BIGINT, field: 'SurgeryRequestId' },
        SurgeryRequestedOn: { type: DataTypes.DATE, field: 'SurgeryRequestedOn' },
        AdmissionDoctorId: { type: DataTypes.BIGINT, field: 'AdmissionDoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        SurgeryStartedate: { type: DataTypes.DATE, field: 'SurgeryStartedate' },
        SurgeryEndDate: { type: DataTypes.DATE, field: 'SurgeryEndDate' },
        StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        DiagnosisName: { type: DataTypes.STRING, field: 'DiagnosisName' },
        OtherDiagnosisId: { type: DataTypes.BIGINT, field: 'OtherDiagnosisId' },
        OtherDiagnosisName: { type: DataTypes.STRING, field: 'OtherDiagnosisName' },
        SurgeryRoomId: { type: DataTypes.BIGINT, field: 'SurgeryRoomId' },
        SurgeryTypeId: { type: DataTypes.BIGINT, field: 'SurgeryTypeId' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        AnaesthesiaTypeId: { type: DataTypes.BIGINT, field: 'AnaesthesiaTypeId' },
        ChiefSurgeonId: { type: DataTypes.BIGINT, field: 'ChiefSurgeonId' },
        AssistantSurgeonId: { type: DataTypes.BIGINT, field: 'AssistantSurgeonId' },
        AnaesthesistId: { type: DataTypes.BIGINT, field: 'AnaesthesistId' },
        ChiefSurgeon2Id: { type: DataTypes.BIGINT, field: 'ChiefSurgeon2Id' },
        AssistantSurgeon2Id: { type: DataTypes.BIGINT, field: 'AssistantSurgeon2Id' },
        Anaesthesist2Id: { type: DataTypes.BIGINT, field: 'Anaesthesist2Id' },
        ChiefSurgeon3Id: { type: DataTypes.BIGINT, field: 'ChiefSurgeon3Id' },
        AssistantSurgeon3Id: { type: DataTypes.BIGINT, field: 'AssistantSurgeon3Id' },
        Anaesthesist3Id: { type: DataTypes.BIGINT, field: 'Anaesthesist3Id' },
        PreoperativeDignosisId: { type: DataTypes.BIGINT, field: 'PreoperativeDignosisId' },
        SurgeryEntryStatusId: { type: DataTypes.BIGINT, field: 'SurgeryEntryStatusId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        Procedure2Id: { type: DataTypes.BIGINT, field: 'Procedure2Id' },
        Procedure3Id: { type: DataTypes.BIGINT, field: 'Procedure3Id' },
        ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
        OtherDiagnosis: { type: DataTypes.STRING, field: 'OtherDiagnosis' },
        OtherSurgeon: { type: DataTypes.STRING, field: 'OtherSurgeon' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsCathlab: { type: DataTypes.BOOLEAN, field: 'IsCathlab' },
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
            tableName: 'hims_surgeryentry',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (SurgeryEntry as any).associate = function (models: Models) {
        SurgeryEntry.belongsTo(models.ReferenceValue, { as: 'SurgeryEntryStatus', targetKey: 'ReferenceValueCodeId' });
        SurgeryEntry.belongsTo(models.User, { as: 'Doctor', foreignKey: 'AdmissionDoctorId' });
        SurgeryEntry.belongsTo(models.User, { as: 'ChiefSurgeon', foreignKey: 'ChiefSurgeonId' });
        SurgeryEntry.belongsTo(models.User, { as: 'Anaesthesist', foreignKey: 'AnaesthesistId' });
        SurgeryEntry.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        SurgeryEntry.belongsTo(models.User, { as: 'AssistantSurgeon', foreignKey: 'AssistantSurgeonId' });
        SurgeryEntry.belongsTo(models.Diagnosis, { as: 'PreDiagnosis', foreignKey: 'PreoperativeDignosisId' });
        SurgeryEntry.belongsTo(models.WardRoomMaster, { as: 'OTRoom', foreignKey: 'SurgeryRoomId' });
        SurgeryEntry.belongsTo(models.SurgeryRoomMaster, { foreignKey: 'SurgeryRoomId' });
        SurgeryEntry.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        SurgeryEntry.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        SurgeryEntry.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        SurgeryEntry.belongsTo(models.ReferenceValue, { as: 'SurgeryType', targetKey: 'ReferenceValueCodeId' });
        SurgeryEntry.belongsTo(models.ReferenceValue, { as: 'AnaesthesiaType', targetKey: 'ReferenceValueCodeId' });
        SurgeryEntry.belongsTo(models.Procedure, { as: 'Procedure', foreignKey: 'ProcedureId' });
        SurgeryEntry.belongsTo(models.Procedure, { as: 'Procedure2', foreignKey: 'Procedure2Id' });
        SurgeryEntry.belongsTo(models.Procedure, { as: 'Procedure3', foreignKey: 'Procedure3Id' });
        SurgeryEntry.belongsTo(models.Patient);
        SurgeryEntry.belongsTo(models.Encounter);
        SurgeryEntry.hasMany(models.SurgeryEntryDetails, { foreignKey: 'SurgeryEntryId' });
        // SurgeryEntry.hasMany(models.OtPatientEquipments);
        SurgeryEntry.hasMany(models.OtNotes, { foreignKey: 'OTRegisterId' });
    };
    return SurgeryEntry;
}
