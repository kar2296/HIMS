import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RoomTypeMasterInstance, i.RoomTypeMasterAttributes> {
    let RoomTypeMaster = sequelize.define<i.RoomTypeMasterInstance, i.RoomTypeMasterAttributes>('RoomTypeMaster', {
        Id: { type: DataTypes.BIGINT, field: 'RoomTypeId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        RoomClassificationTypeId: { type: DataTypes.INTEGER, field: 'RoomClassificationTypeId' },
        RoomTypeName: { type: DataTypes.STRING, field: 'RoomTypeName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
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
            tableName: 'roomtypemaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
     (RoomTypeMaster as any).associate = function(models: Models) {
                    RoomTypeMaster.belongsTo(models.Facility);
                    RoomTypeMaster.belongsTo(models.ServiceRateCategory);
                    RoomTypeMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    RoomTypeMaster.belongsTo(models.ReferenceValue, { as: 'RoomClassificationType', targetKey: 'ReferenceValueCodeId' });
                };
 return RoomTypeMaster;
}
