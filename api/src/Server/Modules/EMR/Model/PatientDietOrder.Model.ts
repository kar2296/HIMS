import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDietOrderInstance, i.PatientDietOrderAttributes> {
    let PatientDietOrder = sequelize.define<i.PatientDietOrderInstance, i.PatientDietOrderAttributes>('PatientDietOrder', {
        Id: { type: DataTypes.BIGINT, field: 'PatientDietOrderId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        OrderTypeId: { type: DataTypes.BIGINT, field: 'OrderTypeId' },
        RoomId: { type: DataTypes.INTEGER, field: 'RoomId' },
        BedId: { type: DataTypes.INTEGER, field: 'BedId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        // EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        EncounterConsultationId: { type: DataTypes.INTEGER, field: 'EncounterConsultationId' },
        OrderNumber: { type: DataTypes.STRING, field: 'OrderNumber' },
        OrderRequestDate: { type: DataTypes.DATE, field: 'OrderRequestDate' },
        OrderScheduleDate: { type: DataTypes.DATE, field: 'OrderScheduleDate' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        OrderFromId: { type: DataTypes.BIGINT, field: 'OrderFromId' },
        OrderToId: { type: DataTypes.BIGINT, field: 'OrderToId' },
        OrderStatusId: { type: DataTypes.INTEGER, field: 'OrderStatusId' },
        DietFrequencyId: { type: DataTypes.BIGINT, field: 'DietFrequencyId' },
        OrderCompletedDate: { type: DataTypes.DATE, field: 'OrderCompletedDate' },
        OrderPriorityId: { type: DataTypes.INTEGER, field: 'OrderPriorityId' },
        OrderToLocation: { type: DataTypes.INTEGER, field: 'OrderToLocation' },
        OrderLocationId: { type: DataTypes.INTEGER, field: 'OrderLocationId' },
        ScheduledDate: { type: DataTypes.DATE, field: 'ScheduledDate' },
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
            tableName: 'patientdietorders',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientDietOrder as any).associate = function (models: Models) {
        PatientDietOrder.belongsTo(models.User, { foreignKey: 'UserId' });
        PatientDietOrder.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientDietOrder.belongsTo(models.ReferenceValue, { as: 'OrderPriority', targetKey: 'ReferenceValueCodeId' });
        PatientDietOrder.belongsTo(models.ReferenceValue, { as: 'DietFrequency', targetKey: 'ReferenceValueCodeId' });
        // PatientDietOrder.belongsTo(models.Department, { foreignKey: 'OrderFromId', as: 'OrderFrom' });
        PatientDietOrder.belongsTo(models.Department, { foreignKey: 'OrderToId', as: 'OrderTo' });
        PatientDietOrder.belongsTo(models.OrderStatus, { foreignKey: 'OrderStatusId' });
        PatientDietOrder.belongsTo(models.Patient);
        PatientDietOrder.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        PatientDietOrder.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        PatientDietOrder.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        PatientDietOrder.hasMany(models.PatientDietOrderDetail);
        PatientDietOrder.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
    };
    return PatientDietOrder;
}
