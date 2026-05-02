import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WardRoomBedMasterInstance, i.WardRoomBedMasterAttributes> {
    let WardRoomBedMaster = sequelize.define<i.WardRoomBedMasterInstance, i.WardRoomBedMasterAttributes>('WardRoomBedMaster', {
        Id: { type: DataTypes.BIGINT, field: 'BedId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.STRING, field: 'RoomId' },
        LocationId: { type: DataTypes.STRING, field: 'LocationId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        BedNo: { type: DataTypes.STRING, field: 'BedNo' },
        Prefix: { type: DataTypes.STRING, field: 'Prefix' },
        IsTemp: { type: DataTypes.BOOLEAN, field: 'IsTemp' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        GracePeriod: { type: DataTypes.INTEGER, field: 'GracePeriod' },
        HalfDay: { type: DataTypes.INTEGER, field: 'HalfDay' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        BedStatusId: { type: DataTypes.INTEGER, field: 'BedStatusId' },
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
            tableName: 'wardroombedmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (WardRoomBedMaster as any).associate = function(models: Models) {
                    WardRoomBedMaster.belongsTo(models.Facility);
                    WardRoomBedMaster.belongsTo(models.ServiceRateCategory);
                    WardRoomBedMaster.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
                    WardRoomBedMaster.belongsTo(models.WardRoomMaster,{ foreignKey: 'RoomId' });
                    WardRoomBedMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    WardRoomBedMaster.belongsTo(models.ReferenceValue, { as: 'BedStatus', targetKey: 'ReferenceValueCodeId' });
                    WardRoomBedMaster.belongsTo(models.LocationMaster, { foreignKey: 'LocationId' });
                };
 return WardRoomBedMaster;
}
