import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OtScheduleInstance, i.OtScheduleAttributes> {
    let OtSchedule = sequelize.define<i.OtScheduleInstance, i.OtScheduleAttributes>('OtSchedule', {
        Id: { type: DataTypes.BIGINT, field: 'OTScheduleId', primaryKey: true, autoIncrement: true },
        OTScheduledOn: { type: DataTypes.DATE, field: 'OTScheduledOn' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        ScheduleTypeId: { type: DataTypes.BIGINT, field: 'ScheduleTypeId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        SurgeonName: { type: DataTypes.STRING, field: 'SurgeonName' },
        Startdate: { type: DataTypes.DATE, field: 'Startdate' },
        Enddate: { type: DataTypes.DATE, field: 'Enddate' },
        StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
        SurgeryCategoryId: { type: DataTypes.BIGINT, field: 'SurgeryCategoryId' },
        AnaesthesiaTypeId: { type: DataTypes.BIGINT, field: 'AnaesthesiaTypeId' },
        OTTechnicianId: { type: DataTypes.STRING, field: 'OTTechnicianId' },
        ScurbNurseId: { type: DataTypes.STRING, field: 'ScurbNurseId' },
        SurgeryTypeId: { type: DataTypes.BIGINT, field: 'SurgeryTypeId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        OtherProcedureId: { type: DataTypes.BIGINT, field: 'OtherProcedureId' },
        ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
        OtherProcedureName: { type: DataTypes.STRING, field: 'OtherProcedureName' },
        OtherDoctorId: { type: DataTypes.BIGINT, field: 'OtherDoctorId' },
        OtherSurgeon: { type: DataTypes.STRING, field: 'OtherSurgeon' },
        AnaesthesistId: { type: DataTypes.BIGINT, field: 'AnaesthesistId' },
        OTScheduleStatusId: { type: DataTypes.BIGINT, field: 'OTScheduleStatusId' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        TeamId: { type: DataTypes.BIGINT, field: 'TeamId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        DiagnosisName: { type: DataTypes.STRING, field: 'DiagnosisName' },
        OtherDiagnosisId: { type: DataTypes.BIGINT, field: 'OtherDiagnosisId' },
        OtherDiagnosisName: { type: DataTypes.STRING, field: 'OtherDiagnosisName' },
        OrderId: { type: DataTypes.BIGINT, field: 'OrderId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Notes: { type: DataTypes.STRING, field: 'Notes' },
        Instruction: { type: DataTypes.STRING, field: 'Instruction' },
        IOLLensTypeId: { type: DataTypes.BIGINT, field: 'IOLLensTypeId' },
        IOLLensNameId: { type: DataTypes.BIGINT, field: 'IOLLensNameId' },
        LensPowerId: { type: DataTypes.BIGINT, field: 'LensPowerId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        ProcedureSideId: { type: DataTypes.BIGINT, field: 'ProcedureSideId' },
        ScheduleBy: { type: DataTypes.BIGINT, field: 'ScheduleBy' },
        ScheduleDate: { type: DataTypes.DATE, field: 'ScheduleDate' },
        SurgeryStartDate: { type: DataTypes.DATE, field: 'SurgeryStartDate' },
        SurgeryEndDate: { type: DataTypes.DATE, field: 'SurgeryEndDate' },
        ConfirmedBy: { type: DataTypes.BIGINT, field: 'ConfirmedBy' },
        ConfirmedDate: { type: DataTypes.DATE, field: 'ConfirmedDate' },
        CancelledBy: { type: DataTypes.BIGINT, field: 'CancelledBy' },
        CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
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
            tableName: 'hims_surgeryschedule',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (OtSchedule as any).associate = function (models: Models) {
        OtSchedule.belongsTo(models.ReferenceValue, {
            as: 'OTScheduleStatus',
            targetKey: 'ReferenceValueCodeId', foreignKey: 'OTScheduleStatusId'
        });
        OtSchedule.belongsTo(models.ReferenceValue, {
            as: 'Team',
            targetKey: 'ReferenceValueCodeId',
            foreignKey: 'TeamId',
        });
        OtSchedule.belongsTo(models.ReferenceValue, {
            as: 'Priority',
            targetKey: 'ReferenceValueCodeId', foreignKey: 'PriorityId'
        });
        OtSchedule.belongsTo(models.ReferenceValue, {
            as: 'SurgeryType',
            targetKey: 'ReferenceValueCodeId', foreignKey: 'SurgeryTypeId'
        });
        OtSchedule.belongsTo(models.ReferenceValue, {
            as: 'AnaesthesiaType',
            targetKey: 'ReferenceValueCodeId', foreignKey: 'AnaesthesiaTypeId'
        });
        OtSchedule.belongsTo(models.ReferenceValue, {
            as: 'OtSchedulrOrder', targetKey: 'ReferenceValueCodeId', foreignKey: 'OrderId'
        });
        OtSchedule.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        OtSchedule.belongsTo(models.Diagnosis, { as: 'Diagnosis', foreignKey: 'DiagnosisId' });
        OtSchedule.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        // OtSchedule.belongsTo(models.User, { as: 'ChiefSurgeon', foreignKey: 'ChiefSurgeonId' });
        OtSchedule.belongsTo(models.Patient);
        OtSchedule.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        OtSchedule.hasMany(models.OtScheduleDetails, { foreignKey: 'OTScheduledId' });
        OtSchedule.belongsTo(models.SurgeryRoomMaster, { foreignKey: 'OTRoomId' });
        OtSchedule.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        OtSchedule.belongsTo(models.Procedure, { foreignKey: 'ProcedureId' });
        OtSchedule.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        OtSchedule.belongsTo(models.User, { as: 'ScheduledUser', foreignKey: 'ScheduleBy' });
        OtSchedule.belongsTo(models.User, { as: 'ConfirmedUser', foreignKey: 'ConfirmedBy' });
        OtSchedule.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        OtSchedule.belongsTo(models.User, { as: 'Anaesthesist', foreignKey: 'AnaesthesistId' });
        OtSchedule.belongsTo(models.ReferenceValue,
            { as: 'IOLLensType', targetKey: 'ReferenceValueCodeId', foreignKey: 'IOLLensTypeId' });
        OtSchedule.belongsTo(models.ReferenceValue,
            { as: 'IOLLensName', targetKey: 'ReferenceValueCodeId', foreignKey: 'IOLLensNameId' });
        OtSchedule.belongsTo(models.ReferenceValue,
            { as: 'LensPower', targetKey: 'ReferenceValueCodeId', foreignKey: 'LensPowerId' });
        OtSchedule.belongsTo(models.PatientGuarantor, { as: 'PatientGuarantor', foreignKey: 'GuarantorId' });
    };
    return OtSchedule;
}
