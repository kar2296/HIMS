import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualConferenceParticipantInstance,
        i.VirtualConferenceParticipantAttributes> {
    let VirtualConferenceParticipant = sequelize.define<i.VirtualConferenceParticipantInstance, i.
        VirtualConferenceParticipantAttributes>('VirtualConferenceParticipant', {
            Id: { type: DataTypes.BIGINT, field: 'ConferenceParticipantId', primaryKey: true, autoIncrement: true },
            OrganizationId: { type: DataTypes.STRING, field: 'OrganizationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            ConferenceId: { type: DataTypes.BIGINT, field: 'ConferenceId' },
            ParticipantName: { type: DataTypes.STRING, field: 'ParticipantName' },
            ParticipantUserId: { type: DataTypes.BIGINT, field: 'ParticipantUserId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
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
                tableName: 'hims_conferenceparticipants',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    // (VirtualConferenceParticipant as any).associate = function (models: Models) {
    //     VirtualConferenceParticipant.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    //     VirtualConferenceParticipant.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    // };
    return VirtualConferenceParticipant;
}
