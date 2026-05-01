import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualConferenceSessionInstance, i.VirtualConferenceSessionAttributes> {
    let VirtualConferenceSession = sequelize.define<i.VirtualConferenceSessionInstance,
        i.VirtualConferenceSessionAttributes>('VirtualConferenceSession', {
            Id: { type: DataTypes.BIGINT, field: 'ConferenceSessionId', primaryKey: true, autoIncrement: true },
            OrganizationId: { type: DataTypes.STRING, field: 'OrganizationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            ConferenceId: { type: DataTypes.BIGINT, field: 'ConferenceId' },
            ConferenceRoomId: { type: DataTypes.STRING, field: 'ConferenceRoomId' },
            StartTime: { type: DataTypes.TIME, field: 'StartTime' },
            EndTime: { type: DataTypes.TIME, field: 'EndTime' },
            Duration: { type: DataTypes.STRING, field: 'Duration' },
            ParticipantCount: { type: DataTypes.STRING, field: 'ParticipantCount' },
            ConferenceXML: { type: DataTypes.STRING, field: 'ConferenceXML' },
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
                tableName: 'hims_conferencesessions',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    // (VirtualConferenceSession as any).associate = function (models: Models) {
    //     VirtualConferenceSession.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    //     VirtualConferenceSession.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    // };
    return VirtualConferenceSession;
}
