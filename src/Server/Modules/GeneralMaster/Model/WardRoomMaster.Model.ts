import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WardRoomMasterInstance, i.WardRoomMasterAttributes> {
    let WardRoomMaster = sequelize.define<i.WardRoomMasterInstance, i.WardRoomMasterAttributes>('WardRoomMaster', {
        Id: { type: DataTypes.BIGINT, field: 'RoomId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomName: { type: DataTypes.STRING, field: 'RoomName' },
        RoomNo: { type: DataTypes.STRING, field: 'RoomNo' },
        RoomTypeId: { type: DataTypes.BIGINT, field: 'RoomTypeId' },
        RoomClassificationTypeId: { type: DataTypes.BIGINT, field: 'RoomClassificationTypeId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        GracePeriod: { type: DataTypes.INTEGER, field: 'GracePeriod' },
        PhotoPath: { type: DataTypes.STRING, field: 'PhotoPath' },
        HalfDay: { type: DataTypes.BOOLEAN, field: 'HalfDay' },
        NoOfBed: { type: DataTypes.INTEGER, field: 'NoOfBed' },
        BedStartNo: { type: DataTypes.INTEGER, field: 'BedStartNo' },
        Prefix: { type: DataTypes.STRING, field: 'Prefix' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'wardroommaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (WardRoomMaster as any).associate = function(models: Models) {
                    WardRoomMaster.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
                    WardRoomMaster.belongsTo(models.LocationMaster, { foreignKey: 'LocationId' });
                    WardRoomMaster.belongsTo(models.ServiceRateCategory);
                    WardRoomMaster.belongsTo(models.Facility);
                    WardRoomMaster.belongsTo(models.RoomTypeMaster, { foreignKey: 'RoomTypeId' });
                    WardRoomMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    WardRoomMaster.belongsTo(models.ReferenceValue, {
                        as: 'RoomClassificationType',
                        targetKey: 'ReferenceValueCodeId',
                        foreignKey: 'RoomClassificationTypeId'
                    });
                };
 return WardRoomMaster;
}
