import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EventDashboardInstance, i.EventDashboardAttributes> {
    let EventDashboard = sequelize.define<i.EventDashboardInstance, i.EventDashboardAttributes>('EventDashboard', {
        Id: { type: DataTypes.BIGINT, field: 'IntegrationEventsId', primaryKey: true, autoIncrement: true },
        EventDirectionId: { type: DataTypes.BIGINT, field: 'EventDirectionId' },
        EventTypeId: { type: DataTypes.BIGINT, field: 'EventTypeId' },
        EventName: { type: DataTypes.STRING, field: 'EventName' },
        EventSourceId: { type: DataTypes.BIGINT, field: 'EventSourceId' },
        EventSourceKey: { type: DataTypes.STRING, field: 'EventSourceKey' },
        EventDestinationId: { type: DataTypes.BIGINT, field: 'EventDestinationId' },
        EvenDestinationKey: { type: DataTypes.BIGINT, field: 'EvenDestinationKey' },
        EntityTypeId: { type: DataTypes.BIGINT, field: 'EntityTypeId' },
        EventEntityId: { type: DataTypes.BIGINT, field: 'EventEntityId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EventDataTypeId: { type: DataTypes.BIGINT, field: 'EventDataTypeId' },
        EventData: { type: DataTypes.STRING, field: 'EventData' },
        EventStatusId: { type: DataTypes.BIGINT, field: 'EventStatusId' },
        EventMessage: { type: DataTypes.STRING, field: 'EventMessage' },
        EventTrace: { type: DataTypes.STRING, field: 'EventTrace' },
        PracticeId: { type: DataTypes.STRING, field: 'PracticeId' },
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
            tableName: 'integrationevents',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (EventDashboard as any).associate = function(models: Models) {
                    EventDashboard.belongsTo(models.ReferenceValue, { as: 'EventType', targetKey: 'ReferenceValueCodeId' });
                    EventDashboard.belongsTo(models.ReferenceValue, { as: 'EventStatus', targetKey: 'ReferenceValueCodeId' });
                    EventDashboard.belongsTo(models.ReferenceValue, { as: 'EventSource', targetKey: 'ReferenceValueCodeId' });
                    EventDashboard.belongsTo(models.ReferenceValue, { as: 'EventDataType', targetKey: 'ReferenceValueCodeId' });
                    EventDashboard.belongsTo(models.ReferenceValue, { as: 'EventDestination', targetKey: 'ReferenceValueCodeId' });
                  };
 return EventDashboard;
}
