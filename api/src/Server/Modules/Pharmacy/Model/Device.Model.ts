import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DeviceInstance, i.DeviceAttributes> {
    let Device = sequelize.define<i.DeviceInstance, i.DeviceAttributes>('Device', {
        Id: { type: DataTypes.BIGINT, field: 'DeviceId', primaryKey: true, autoIncrement: true },
        DeviceCode: { type: DataTypes.STRING, field: 'DeviceCode' },
        DeviceName: { type: DataTypes.STRING, field: 'DeviceName' },
        Location: { type: DataTypes.STRING, field: 'Location' },
        DeviceManufacturerId: { type: DataTypes.INTEGER, field: 'DeviceManufacturerId' },
        ManufacturerName: { type: DataTypes.STRING, field: 'ManufacturerName' },
        ModelNo: { type: DataTypes.STRING, field: 'ModelNo' },
        SerialNo: { type: DataTypes.STRING, field: 'SerialNo' },
        OrganizationId: { type: DataTypes.INTEGER, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'hims_device',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Device as any).associate = function (models: Models) {
        Device.belongsTo(models.DeviceManufacturer, { foreignKey: 'DeviceManufacturerId' });
        Device.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return Device;
}
