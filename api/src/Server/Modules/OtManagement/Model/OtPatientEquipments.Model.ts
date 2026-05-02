import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OtPatientEquipmentsInstance, i.OtPatientEquipmentsAttributes> {
    let OtPatientEquipments = sequelize.define<i.OtPatientEquipmentsInstance, i.OtPatientEquipmentsAttributes>('OtPatientEquipments', {
        Id: { type: DataTypes.BIGINT, field: 'PatientEquipmentId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        EquipmentId: { type: DataTypes.BIGINT, field: 'EquipmentId' },
        IsBilled: { type: DataTypes.BOOLEAN, field: 'IsBilled' },
        ChargeTypeId: { type: DataTypes.BIGINT, field: 'ChargeTypeId' },
        EquipmentName: { type: DataTypes.STRING, field: 'EquipmentName' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        StartTime: { type: DataTypes.DATE, field: 'StartTime' },
        StopTime: { type: DataTypes.DATE, field: 'StopTime' },
        StartedBy: { type: DataTypes.INTEGER, field: 'StartedBy' },
        StoppedBy: { type: DataTypes.INTEGER, field: 'StoppedBy' },
        TotalHours: { type: DataTypes.INTEGER, field: 'TotalHours' },
        Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
        TotalAmount: { type: DataTypes.DECIMAL, field: 'TotalAmount' },
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
            tableName: 'patientequipments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (OtPatientEquipments as any).associate = function (models: Models) {
        OtPatientEquipments.belongsTo(models.ServiceItem, { foreignKey: 'EquipmentId' });
        OtPatientEquipments.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        OtPatientEquipments.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        OtPatientEquipments.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        OtPatientEquipments.belongsTo(models.Patient);
        OtPatientEquipments.belongsTo(models.Encounter);
    };
    return OtPatientEquipments;
}
