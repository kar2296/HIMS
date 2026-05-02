import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BedTransportationInstance, i.BedTransportationAttributes> {
    let BedTransportation = sequelize.define<i.BedTransportationInstance, i.BedTransportationAttributes>('BedTransportation', {
        Id: { type: DataTypes.BIGINT, field: 'TransportId', primaryKey: true, autoIncrement: true },
        TransportIdentifier: { type: DataTypes.STRING, field: 'TransportIdentifier' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        FromLocationId: { type: DataTypes.BIGINT, field: 'FromLocationId' },
        ToLocationId: { type: DataTypes.BIGINT, field: 'ToLocationId' },
        FromRoomId: { type: DataTypes.BIGINT, field: 'FromRoomId' },
        FromBedId: { type: DataTypes.BIGINT, field: 'FromBedId' },
        FromWardId: { type: DataTypes.BIGINT, field: 'FromWardId' },
        ToRoomId: { type: DataTypes.BIGINT, field: 'ToRoomId' },
        ToBedId: { type: DataTypes.BIGINT, field: 'ToBedId' },
        ToWardId: { type: DataTypes.BIGINT, field: 'ToWardId' },
        FromBlockId: { type: DataTypes.BIGINT, field: 'FromBlockId' },
        ToBlockId: { type: DataTypes.BIGINT, field: 'ToBlockId' },
        RequestTypeId: { type: DataTypes.BIGINT, field: 'RequestTypeId' },
        BedstatusId: { type: DataTypes.BIGINT, field: 'BedstatusId' },
        TransportActivityId: { type: DataTypes.BIGINT, field: 'TransportActivityId' },
        AssignedId: { type: DataTypes.BIGINT, field: 'AssignedId' },
        AmbulanceId: { type: DataTypes.BIGINT, field: 'AmbulanceId' },
        TransportstatusId: { type: DataTypes.BIGINT, field: 'TransportstatusId' },
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
            tableName: 'bedtransportation',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (BedTransportation as any).associate = function(models: Models) {
                    BedTransportation.belongsTo(models.Patient);
                    BedTransportation.belongsTo(models.WardMaster, {as:'FromWard', foreignKey: 'FromWardId' });
                    BedTransportation.belongsTo(models.WardRoomMaster, {as:'FromRoom', foreignKey: 'FromRoomId' });
                    BedTransportation.belongsTo(models.WardRoomBedMaster, {as:'FromBed', foreignKey: 'FromBedId' });
                    BedTransportation.belongsTo(models.User, { as: 'Assigned', foreignKey: 'AssignedId' });
                    BedTransportation.belongsTo(models.User, { as: 'CreatedById', foreignKey: 'CreatedBy' });
                    BedTransportation.belongsTo(models.ReferenceValue, { as: 'TransportStatus', targetKey: 'ReferenceValueCodeId' });
                    BedTransportation.belongsTo(models.ReferenceValue, { as: 'TransportActivity', targetKey: 'ReferenceValueCodeId' });
                    BedTransportation.belongsTo(models.ReferenceValue, { as: 'RequestType', targetKey: 'ReferenceValueCodeId' });
                };
 return BedTransportation;
}
