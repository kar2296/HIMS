import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BedTransferInstance, i.BedTransferAttributes> {
    let BedTransfer = sequelize.define<i.BedTransferInstance, i.BedTransferAttributes>('BedTransfer', {
        Id: { type: DataTypes.BIGINT, field: 'AdmissionTransferId', primaryKey: true, autoIncrement: true },
        RequestIdentifier: { type: DataTypes.BIGINT, field: 'RequestIdentifier' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        RequestDate: { type: DataTypes.DATE, field: 'RequestDate' },
        TransferDate: { type: DataTypes.DATE, field: 'TransferDate' },
        FromFacilityId: { type: DataTypes.BIGINT, field: 'FromFacilityId' },
        FromLocationId: { type: DataTypes.BIGINT, field: 'FromLocationId' },
        FromWardId: { type: DataTypes.BIGINT, field: 'FromWardId' },
        FromRoomId: { type: DataTypes.BIGINT, field: 'FromRoomId' },
        FromBedId: { type: DataTypes.BIGINT, field: 'FromBedId' },
        RequestedBy: { type: DataTypes.INTEGER, field: 'RequestedBy' },
        RequestComments: { type: DataTypes.STRING, field: 'RequestComments' },
        RequestedStatusId: { type: DataTypes.BIGINT, field: 'RequestedStatusId' },
        ToFacilityId: { type: DataTypes.BIGINT, field: 'ToFacilityId' },
        ToLocationId: { type: DataTypes.BIGINT, field: 'ToLocationId' },
        ToWardId: { type: DataTypes.BIGINT, field: 'ToWardId' },
        ToRoomId: { type: DataTypes.BIGINT, field: 'ToRoomId' },
        ToBedId: { type: DataTypes.BIGINT, field: 'ToBedId' },
        RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
        AdmissionStatusId: { type: DataTypes.BIGINT, field: 'AdmissionStatusId' },
        ReqCompletedBy: { type: DataTypes.INTEGER, field: 'ReqCompletedBy' },
        ReqCompletedComments: { type: DataTypes.STRING, field: 'ReqCompletedComments' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        ToServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ToServiceRateCategoryId' },
        IsDoubleOccupancy: { type: DataTypes.BOOLEAN, field: 'IsDoubleOccupancy' },
        IsPrimaryBed: { type: DataTypes.BOOLEAN, field: 'IsPrimaryBed' },
        IsOtTransfer: { type: DataTypes.BOOLEAN, field: 'IsOtTransfer' },
        ReceivedBy: { type: DataTypes.BIGINT, field: 'ReceivedBy' },
        ReceivedStatusId: { type: DataTypes.BIGINT, field: 'ReceivedStatusId' },
        ReceivedDate: { type: DataTypes.DATE, field: 'ReceivedDate' },
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
            tableName: 'bedtransfer',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (BedTransfer as any).associate = function (models: Models) {
        BedTransfer.belongsTo(models.WardMaster, { as: 'ToWard', foreignKey: 'ToWardId' });
        BedTransfer.belongsTo(models.WardRoomMaster, { as: 'ToRoom', foreignKey: 'ToRoomId' });
        BedTransfer.belongsTo(models.WardRoomBedMaster, { as: 'ToBed', foreignKey: 'ToBedId' });
        BedTransfer.belongsTo(models.WardMaster, { as: 'FromWard', foreignKey: 'FromWardId' });
        BedTransfer.belongsTo(models.WardRoomMaster, { as: 'FromRoom', foreignKey: 'FromRoomId' });
        BedTransfer.belongsTo(models.WardRoomBedMaster, { as: 'FromBed', foreignKey: 'FromBedId' });
        BedTransfer.belongsTo(models.ServiceRateCategory, { as: 'FromServiceRateCategory', foreignKey: 'ServiceRateCategoryId' });
        BedTransfer.belongsTo(models.ServiceRateCategory, { as: 'ToServiceRateCategory', foreignKey: 'ToServiceRateCategoryId' });
        BedTransfer.belongsTo(models.Patient);
        BedTransfer.belongsTo(models.Department);
        BedTransfer.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        BedTransfer.belongsTo(models.User, { as: 'Created', foreignKey: 'CreatedBy' });
        BedTransfer.belongsTo(models.User, { as: 'ReqCompleted', foreignKey: 'ReqCompletedBy' });
        BedTransfer.belongsTo(models.ReferenceValue, { as: 'RequestedStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return BedTransfer;
}
