import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WardRoomServiceMapInstance, i.WardRoomServiceMapAttributes> {
    let WardRoomServiceMap = sequelize.define<i.WardRoomServiceMapInstance, i.WardRoomServiceMapAttributes>('WardRoomServiceMap', {
        Id: { type: DataTypes.BIGINT, field: 'WardRoomServiceId', primaryKey: true, autoIncrement: true },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        ApplyMainOccupancy: { type: DataTypes.BOOLEAN, field: 'ApplyMainOccupancy' },
        ApplyDoubleOccupancy: { type: DataTypes.BOOLEAN, field: 'ApplyDoubleOccupancy' },
        IsHourApply: { type: DataTypes.BOOLEAN, field: 'IsHourApply' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        //IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'wardroomservicemap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (WardRoomServiceMap as any).associate = function(models: Models) {
                    WardRoomServiceMap.belongsTo(models.ServiceItem, { foreignKey: 'ServiceItemId' });
                    WardRoomServiceMap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return WardRoomServiceMap;
}
