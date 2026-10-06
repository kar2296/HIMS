import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';
export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualConferenceInstance, i.VirtualConferenceAttributes> {
    let VirtualConference = sequelize.define<i.VirtualConferenceInstance, i.VirtualConferenceAttributes>('VirtualConference', {
        Id: { type: DataTypes.BIGINT, field: 'ConferenceId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.STRING, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ConferenceScheduleDate: { type: DataTypes.DATE, field: 'ConferenceScheduleDate' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        AppointmentId: { type: DataTypes.BIGINT, field: 'AppointmentId' },
        OrderId: { type: DataTypes.BIGINT, field: 'OrderId' },
        ParticipantTypeId: { type: DataTypes.BIGINT, field: 'ParticipantTypeId' },
        ConferenceName: { type: DataTypes.STRING, field: 'ConferenceName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ConferenceDate: { type: DataTypes.DATE, field: 'ConferenceDate' },
        ConferenceTime: { type: DataTypes.TIME, field: 'ConferenceTime' },
        Duration: { type: DataTypes.BIGINT, field: 'Duration' },
        AllowRecording: { type: DataTypes.BOOLEAN, field: 'AllowRecording' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.BIGINT, field: 'DoctorName' },
        StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        ConferenceStatusId: { type: DataTypes.BIGINT, field: 'ConferenceStatusId' },
        ConferenceRoomId: { type: DataTypes.STRING, field: 'ConferenceRoomId' },
        ActualDuration: { type: DataTypes.STRING, field: 'ActualDuration' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        LockSettingsDisablePrivateChat: { type: DataTypes.BOOLEAN, field: 'LockSettingsDisablePrivateChat' },
        LockSettingsDisableCam: { type: DataTypes.BOOLEAN, field: 'LockSettingsDisableCam' },
        WebcamsOnlyForModerator: { type: DataTypes.BOOLEAN, field: 'WebcamsOnlyForModerator' },
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
            tableName: 'hims_conferences',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
    (VirtualConference as any).associate = function (models: Models) {
        VirtualConference.belongsTo(models.VirtualOrder, { foreignKey: 'OrderId' });
    };
    return VirtualConference;
}
