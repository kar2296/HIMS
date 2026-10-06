import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientTrackerInstance, i.PatientTrackerAttributes> {
    let PatientTracker = sequelize.define<i.PatientTrackerInstance, i.PatientTrackerAttributes>('PatientTracker', {
        Id: { type: DataTypes.BIGINT, field: 'PatientTrackerId', primaryKey: true, autoIncrement: true },
        PrevAppointmentId: { type: DataTypes.BIGINT, field: 'PrevAppointmentId' },
        ParentTrackId: { type: DataTypes.BIGINT, field: 'ParentTrackId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        AppointmentId: { type: DataTypes.BIGINT, field: 'AppointmentId' },
        AppointmentName: { type: DataTypes.STRING, field: 'AppointmentName' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AssignedRoomId: { type: DataTypes.BIGINT, field: 'AssignedRoomId' },
        AssignedRoomName: { type: DataTypes.STRING, field: 'AssignedRoomName' },
        AssignedGroupId: { type: DataTypes.BIGINT, field: 'AssignedGroupId' },
        AssignedGroupName: { type: DataTypes.STRING, field: 'AssignedGroupName' },
        AssignedUserId: { type: DataTypes.BIGINT, field: 'AssignedUserId' },
        AssignedUserName: { type: DataTypes.STRING, field: 'AssignedUserName' },
        AssignedUserDepartmentId: { type: DataTypes.STRING, field: 'AssignedUserDepartmentId' },
        AssignedDate: { type: DataTypes.DATE, field: 'AssignedDate' },
        AttendUserId: { type: DataTypes.BIGINT, field: 'AttendUserId' },
        AttendUserName: { type: DataTypes.STRING, field: 'AttendUserName' },
        CalledTime: { type: DataTypes.DATE, field: 'CalledTime' },
        AttendTime: { type: DataTypes.DATE, field: 'AttendTime' },
        AttendingRoomId: { type: DataTypes.BIGINT, field: 'AttendingRoomId' },
        AttendingRoomName: { type: DataTypes.STRING, field: 'AttendingRoomName' },
        TrackerStatusId: { type: DataTypes.BIGINT, field: 'TrackerStatusId' },
        TrackerComments: { type: DataTypes.STRING, field: 'TrackerComments' },
        TrackerNotes: { type: DataTypes.STRING, field: 'TrackerNotes' },
        FollowupAppointmentOn: { type: DataTypes.DATE, field: 'FollowupAppointmentOn' },
        IncludeReviewNotes: { type: DataTypes.BOOLEAN, field: 'IncludeReviewNotes' },
        LagInMins: { type: DataTypes.INTEGER, field: 'LagInMins' },
        ClinicalStatusId: { type: DataTypes.BIGINT, field: 'ClinicalStatusId' },
        Duration: { type: DataTypes.INTEGER, field: 'Duration' },
        DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        IsDischargeMedication: { type: DataTypes.BOOLEAN, field: 'IsDischargeMedication' },
        IsSMSNotified: { type: DataTypes.BOOLEAN, field: 'IsSMSNotified' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        FollowupComments1: { type: DataTypes.STRING, field: 'FollowupComments1' },
        FollowupBy1: { type: DataTypes.STRING, field: 'FollowupBy1' },
        FollowupDate1: { type: DataTypes.DATE, field: 'FollowupDate1' },
        FollowupComments2: { type: DataTypes.STRING, field: 'FollowupComments2' },
        FollowupBy2: { type: DataTypes.STRING, field: 'FollowupBy2' },
        FollowupDate2: { type: DataTypes.DATE, field: 'FollowupDate2' },
        FollowupComments3: { type: DataTypes.STRING, field: 'FollowupComments3' },
        FollowupBy3: { type: DataTypes.STRING, field: 'FollowupBy3' },
        FollowupDate3: { type: DataTypes.DATE, field: 'FollowupDate3' },
        FollowupTrackerStatusId: { type: DataTypes.INTEGER, field: 'FollowupTrackerStatusId' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patienttrackers',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
    (PatientTracker as any).associate = function (models: Models) {
        PatientTracker.belongsTo(models.User, { as: 'AttendUser', foreignKey: 'AttendUserId' });
        PatientTracker.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        PatientTracker.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientTracker.belongsTo(models.Department, { as: 'Department', foreignKey: 'AssignedUserDepartmentId' });
        PatientTracker.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientTracker.belongsTo(models.ReferenceValue, {
            as: 'ReferrerClinicalStatus',
            foreignKey: 'ClinicalStatusId', targetKey: 'ReferenceValueCodeId'
        });
        PatientTracker.belongsTo(models.ReferenceValue,
            { as: 'AppointmentStatus', foreignKey: 'TrackerStatusId', targetKey: 'ReferenceValueCodeId' });
        PatientTracker.belongsTo(models.ReferenceValue, { as: 'FollowupTrackerStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientTracker;
}
