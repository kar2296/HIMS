import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BedHousekeepingInstance, i.BedHousekeepingAttributes> {
    let BedHousekeeping = sequelize.define<i.BedHousekeepingInstance, i.BedHousekeepingAttributes>('BedHousekeeping', {
        Id: { type: DataTypes.BIGINT, field: 'HousekeepingId', primaryKey: true, autoIncrement: true },
        RequestIdentifier: { type: DataTypes.STRING, field: 'RequestIdentifier' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        LocationId: { type: DataTypes.INTEGER, field: 'LocationId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RequestTypeId: { type: DataTypes.BIGINT, field: 'RequestTypeId' },
        BedStatusId: { type: DataTypes.BIGINT, field: 'BedStatusId' },
        HousekeepingActivityId: { type: DataTypes.BIGINT, field: 'HousekeepingActivityId' },
        AssignedId: { type: DataTypes.BIGINT, field: 'AssignedId' },
        HousekeepingStatusId: { type: DataTypes.BIGINT, field: 'HousekeepingStatusId' },
        TransactionId: { type: DataTypes.BIGINT, field: 'TransactionId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Attachment: { type: DataTypes.STRING, field: 'Attachment' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
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
            tableName: 'bedhousekeeping',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (BedHousekeeping as any).associate = function(models: Models) {
                    BedHousekeeping.belongsTo(models.Patient);
                    BedHousekeeping.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
                    BedHousekeeping.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
                    BedHousekeeping.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
                    BedHousekeeping.belongsTo(models.User, { as: 'Assigned', foreignKey: 'AssignedId' });
                    BedHousekeeping.belongsTo(models.User, { as: 'CreatedById', foreignKey: 'CreatedBy' });
                    BedHousekeeping.belongsTo(models.ReferenceValue, { as: 'HousekeepingStatus', targetKey: 'ReferenceValueCodeId' });
                    BedHousekeeping.belongsTo(models.ReferenceValue, { as: 'HousekeepingActivity', targetKey: 'ReferenceValueCodeId' });
                    BedHousekeeping.belongsTo(models.ReferenceValue, { as: 'RequestType', targetKey: 'ReferenceValueCodeId' });
                };
 return BedHousekeeping;
}
