import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EventTemplateInstance, i.EventTemplateAttributes> {
    let EventTemplate = sequelize.define<i.EventTemplateInstance, i.EventTemplateAttributes>('EventTemplate', {
       Id: { type: DataTypes.BIGINT, field: 'EventTemplateId', primaryKey: true, autoIncrement: true  },
       EventTypeId: { type: DataTypes.INTEGER, field: 'EventTypeId' },
       FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       TemplateContent: { type: DataTypes.STRING, field: 'TemplateContent' },
       SmsTrigger: { type: DataTypes.STRING, field: 'SmsTrigger' },
       SampleMessage: { type: DataTypes.STRING, field: 'SampleMessage' },
       ScheduleTime: { type: DataTypes.STRING, field: 'ScheduleTime' },
       IsRepeat: { type: DataTypes.BOOLEAN, field: 'IsRepeat' },
       RepeatDuration: { type: DataTypes.STRING, field: 'RepeatDuration' },
       SentToPersonId: { type: DataTypes.BIGINT, field: 'SentToPersonId' },
       SentToPerson: { type: DataTypes.STRING, field: 'SentToPerson' },
       SentToGroupId: { type: DataTypes.BIGINT, field: 'SentToGroupId' },
       SentToGroup: { type: DataTypes.STRING, field: 'SentToGroup' },
       ModuleId: { type: DataTypes.BIGINT, field: 'ModuleId' },
       ModuleName: { type: DataTypes.STRING, field: 'ModuleName' },
       IsCronJob: { type: DataTypes.BOOLEAN, field: 'IsCronJob' },
       IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
       ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
       Status: { type: DataTypes.INTEGER, field: 'Status' },
       Rev: { type: DataTypes.INTEGER, field: 'Rev' },
       CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
       CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
       UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
       UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
       EmailSubject: { type: DataTypes.STRING, field: 'EmailSubject' },
       TemplateKey: { type: DataTypes.STRING, field: 'TemplateKey' },
    },
        {
            indexes: [],
            classMethods: {},
            timestamps: true,
            tableName: 'eventtemplates',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

        (EventTemplate as any).associate = function(models: Models) {
            EventTemplate.belongsTo(models.ReferenceValue, { as: 'EventType', targetKey: 'ReferenceValueCodeId' });
            EventTemplate.belongsTo(models.Facility);
            EventTemplate.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        };

    return EventTemplate;
}
