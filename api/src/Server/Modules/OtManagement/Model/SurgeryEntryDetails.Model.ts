import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SurgeryEntryDetailsInstance, i.SurgeryEntryDetailsAttributes> {
    let SurgeryEntryDetails = sequelize.define<i.SurgeryEntryDetailsInstance, i.SurgeryEntryDetailsAttributes>('SurgeryEntryDetails', {
        Id: { type: DataTypes.BIGINT, field: 'SurgeryEntryDetailId', primaryKey: true, autoIncrement: true },
        SurgeryEntryId: { type: DataTypes.BIGINT, field: 'SurgeryEntryId' },
        // SurgeryEntrydOn: { type: DataTypes.DATE, field: 'SurgeryEntrydOn' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        // PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        // SurgeryEntrydId: { type: DataTypes.DATE, field: 'SurgeryEntrydId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DepartmentName: { type: DataTypes.STRING, field: 'DepartmentName' },
        ChiefSurgeonId: { type: DataTypes.BIGINT, field: 'ChiefSurgeonId' },
        ChiefSurgeonName: { type: DataTypes.STRING, field: 'ChiefSurgeonName' },
        SecondSurgeonId: { type: DataTypes.BIGINT, field: 'SecondSurgeonId' },
        SecondSurgeonName: { type: DataTypes.STRING, field: 'SecondSurgeonName' },
        AssistantSurgeonId: { type: DataTypes.BIGINT, field: 'AssistantSurgeonId' },
        AssistantSurgeonName: { type: DataTypes.STRING, field: 'AssistantSurgeonName' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        // PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        // DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        // SurgeonName: { type: DataTypes.STRING, field: 'SurgeonName' },
        // Startdate: { type: DataTypes.DATE, field: 'Startdate' },
        // Enddate: { type: DataTypes.DATE, field: 'Enddate' },
        // StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        // EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        // OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
        // SurgeryCategoryId: { type: DataTypes.BIGINT, field: 'SurgeryCategoryId' },
        // AnaesthesiaTypeId: { type: DataTypes.BIGINT, field: 'AnaesthesiaTypeId' },
        // OTTechnicianId: { type: DataTypes.STRING, field: 'OTTechnicianId' },
        // ScurbNurseId: { type: DataTypes.STRING, field: 'ScurbNurseId' },
        // SurgeryTypeId: { type: DataTypes.BIGINT, field: 'SurgeryTypeId' },
        // ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        // OtherProcedureId: { type: DataTypes.BIGINT, field: 'OtherProcedureId' },
        // ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
        // OtherProcedureName: { type: DataTypes.STRING, field: 'OtherProcedureName' },
        // OtherDoctorId: { type: DataTypes.BIGINT, field: 'OtherDoctorId' },
        // OtherSurgeon: { type: DataTypes.STRING, field: 'OtherSurgeon' },
        // AnaesthesistId: { type: DataTypes.BIGINT, field: 'AnaesthesistId' },
        // SurgeryEntryStatusId: { type: DataTypes.BIGINT, field: 'SurgeryEntryStatusId' },
        // Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        // DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        // TeamId: { type: DataTypes.BIGINT, field: 'TeamId' },
        // WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        // RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        // BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        // DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        // DiagnosisName: { type: DataTypes.STRING, field: 'DiagnosisName' },
        // OtherDiagnosisId: { type: DataTypes.BIGINT, field: 'OtherDiagnosisId' },
        // OtherDiagnosisName: { type: DataTypes.STRING, field: 'OtherDiagnosisName' },
        // OrderId: { type: DataTypes.BIGINT, field: 'OrderId' },
        // Comments: { type: DataTypes.STRING, field: 'Comments' },
        // Notes: { type: DataTypes.STRING, field: 'Notes' },
        // Instruction: { type: DataTypes.STRING, field: 'Instruction' },
        // IOLLensTypeId: { type: DataTypes.BIGINT, field: 'IOLLensTypeId' },
        // IOLLensNameId: { type: DataTypes.BIGINT, field: 'IOLLensNameId' },
        // LensPowerId: { type: DataTypes.BIGINT, field: 'LensPowerId' },
        // GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        // ProcedureSideId: { type: DataTypes.BIGINT, field: 'ProcedureSideId' },
        // ScheduleBy: { type: DataTypes.BIGINT, field: 'ScheduleBy' },
        // ScheduleDate: { type: DataTypes.DATE, field: 'ScheduleDate' },
        // ConfirmedBy: { type: DataTypes.BIGINT, field: 'ConfirmedBy' },
        // ConfirmedDate: { type: DataTypes.DATE, field: 'ConfirmedDate' },
        // CancelledBy: { type: DataTypes.BIGINT, field: 'CancelledBy' },
        // CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
        // IsCathlab: { type: DataTypes.BOOLEAN, field: 'IsCathlab' },
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
            tableName: 'hims_surgeryentrydetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (SurgeryEntryDetails as any).associate = function (models: Models) {

        // SurgeryEntryDetails.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        // SurgeryEntry.belongsTo(models.User, { as: 'ChiefSurgeon', foreignKey: 'ChiefSurgeonId' });
        SurgeryEntryDetails.belongsTo(models.Patient);
        SurgeryEntryDetails.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        SurgeryEntryDetails.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        SurgeryEntryDetails.belongsTo(models.Procedure, { foreignKey: 'ProcedureId' });
        // SurgeryEntryDetails.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        // SurgeryEntryDetails.belongsTo(models.User, { as: 'ScheduledUser', foreignKey: 'ScheduleBy' });
        // SurgeryEntryDetails.belongsTo(models.User, { as: 'ConfirmedUser', foreignKey: 'ConfirmedBy' });
        // SurgeryEntryDetails.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        // SurgeryEntryDetails.belongsTo(models.User, { as: 'Anaesthesist', foreignKey: 'AnaesthesistId' });
        // SurgeryEntryDetails.belongsTo(models.ReferenceValue,
        //     { as: 'IOLLensType', targetKey: 'ReferenceValueCodeId', foreignKey: 'IOLLensTypeId' });
        //     SurgeryEntryDetails.belongsTo(models.ReferenceValue,
        //     { as: 'IOLLensName', targetKey: 'ReferenceValueCodeId', foreignKey: 'IOLLensNameId' });
        //     SurgeryEntryDetails.belongsTo(models.ReferenceValue,
        //     { as: 'LensPower', targetKey: 'ReferenceValueCodeId', foreignKey: 'LensPowerId' });
        //     SurgeryEntryDetails.belongsTo(models.PatientGuarantor, { as: 'PatientGuarantor', foreignKey: 'GuarantorId' });
    };
    return SurgeryEntryDetails;
}
