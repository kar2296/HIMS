import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.MessageInstance, i.MessageAttributes> {
    let Message = sequelize.define<i.MessageInstance, i.MessageAttributes>('Message', {
        Id: { type: DataTypes.BIGINT, field: 'MessageId', primaryKey: true, autoIncrement: true },
        ParentMessageId: { type: DataTypes.BIGINT, field: 'ParentMessageId' },
        UserTypeId: { type: DataTypes.BIGINT, field: 'UserTypeId' },
        SendDate: { type: DataTypes.DATE, field: 'SendDate' },
        FromUserId: { type: DataTypes.BIGINT, field: 'FromUserId' },
        ToUserId: { type: DataTypes.BIGINT, field: 'ToUserId' },
        MessageTypeId: { type: DataTypes.BIGINT, field: 'MessageTypeId' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        Subject: { type: DataTypes.STRING, field: 'Subject' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ToOrganizationId: { type: DataTypes.BIGINT, field: 'ToOrganizationId' },
        ToFacilityId: { type: DataTypes.BIGINT, field: 'ToFacilityId' },
        MessageStatusId: { type: DataTypes.BIGINT, field: 'MessageStatusId' },
        Attachment: { type: DataTypes.STRING, field: 'Attachment' },
        IsRead: { type: DataTypes.BOOLEAN, field: 'IsRead' },
        ReadDate: { type: DataTypes.DATE, field: 'ReadDate' },
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
            tableName: 'messages',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Message as any).associate = function (models: Models) {
        Message.belongsTo(models.Facility);
        Message.belongsTo(models.User, { as: 'FromUser', foreignKey: 'FromUserId' });
        Message.belongsTo(models.User, { as: 'ToUser', foreignKey: 'ToUserId' });
        Message.belongsTo(models.Patient, { foreignKey: 'ToUserId' });
        Message.belongsTo(models.ReferenceValue, { as: 'MessageStatus', targetKey: 'ReferenceValueCodeId' });
        Message.belongsTo(models.ReferenceValue, { as: 'MessageType', targetKey: 'ReferenceValueCodeId' });
        Message.belongsTo(models.ReferenceValue, {
            as: 'PRIORITY', foreignKey: 'PriorityId',
            targetKey: 'ReferenceValueCodeId'
        });
    };
    return Message;
}
