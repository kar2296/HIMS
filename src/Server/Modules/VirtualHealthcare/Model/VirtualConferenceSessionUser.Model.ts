import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualConferenceSessionUserInstance, i.VirtualConferenceSessionUserAttributes> {
    let VirtualConferenceSessionUser = sequelize.define<i.VirtualConferenceSessionUserInstance, i.
        VirtualConferenceSessionUserAttributes>('VirtualConferenceSessionUser', {
            Id: { type: DataTypes.BIGINT, field: 'ConferenceSessionUserId', primaryKey: true, autoIncrement: true },
            ConferenceRoomId: { type: DataTypes.STRING, field: 'ConferenceRoomId' },
            ExternalUserId: { type: DataTypes.BIGINT, field: 'ExternalUserId' },
            Name: { type: DataTypes.STRING, field: 'Name' },
            Role: { type: DataTypes.STRING, field: 'Role' },
            JoinedTime: { type: DataTypes.DATE, field: 'JoinedTime' },
            LeftTime: { type: DataTypes.DATE, field: 'LeftTime' },
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
                tableName: 'hims_conferencesessionusers',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    // (VirtualConferenceSessionUser as any).associate = function (models: Models) {
    //     VirtualConferenceSessionUser.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    //     VirtualConferenceSessionUser.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    // };
    return VirtualConferenceSessionUser;
}
