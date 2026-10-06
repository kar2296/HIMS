import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BedReservationDetailInstance, i.BedReservationDetailAttributes> {
    let BedReservationDetail = sequelize.define<i.BedReservationDetailInstance, i.BedReservationDetailAttributes>('BedReservationDetail', {
        Id: { type: DataTypes.BIGINT, field: 'BedReservationDetailId', primaryKey: true, autoIncrement: true },
        ReserveMaintenanceTypeId: { type: DataTypes.BIGINT, field: 'ReserveMaintenanceTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        BedReservationTypeId: { type: DataTypes.BIGINT, field: 'BedReservationTypeId' },
        BedMaintenanceTypeId: { type: DataTypes.BIGINT, field: 'BedMaintenanceTypeId' },
        FromDate: { type: DataTypes.DATE, field: 'FromDate' },
        ToDate: { type: DataTypes.DATE, field: 'ToDate' },
        Details: { type: DataTypes.STRING, field: 'Details' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        ReleaseStatusId: { type: DataTypes.INTEGER, field: 'ReleaseStatusId' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        ReleasedById: { type: DataTypes.INTEGER, field: 'ReleasedById' },
        ReleasedOn: { type: DataTypes.DATE, field: 'ReleasedOn' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'bedreservationdetail',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (BedReservationDetail as any).associate = function(models: Models) {
                    BedReservationDetail.belongsTo(models.User, { as:'ReleasedBy', foreignKey: 'ReleasedById' });
                    BedReservationDetail.belongsTo(models.User, { as:'ReservedBy', foreignKey: 'CreatedBy' });
                    BedReservationDetail.belongsTo(models.ReferenceValue, { as: 'BedMaintenanceType', targetKey: 'ReferenceValueCodeId' });
                    BedReservationDetail.belongsTo(models.ReferenceValue, { as: 'BedReservationType', targetKey: 'ReferenceValueCodeId' });
                    BedReservationDetail.belongsTo(models.ReferenceValue, { as: 'ReleaseStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return BedReservationDetail;
}
