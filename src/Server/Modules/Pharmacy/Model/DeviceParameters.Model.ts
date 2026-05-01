import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DeviceParametersInstance, i.DeviceParametersAttributes> {
    let DeviceParameters = sequelize.define<i.DeviceParametersInstance, i.DeviceParametersAttributes>('DeviceParameters', {
        Id: { type: DataTypes.BIGINT, field: 'DeviceParametersId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        UOM: { type: DataTypes.STRING, field: 'UOM' },
        Mnemonic: { type: DataTypes.STRING, field: 'Mnemonic' },
        DisplayOrder: { type: DataTypes.STRING, field: 'DisplayOrder' },
        DeviceParameterTypeId: { type: DataTypes.INTEGER, field: 'DeviceParameterTypeId' },
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
            tableName: 'hims_deviceparameters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (DeviceParameters as any).associate = function (models: Models) {
        DeviceParameters.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        DeviceParameters.belongsTo(models.ReferenceValue, { as: 'DeviceParameterType', targetKey: 'ReferenceValueCodeId' });
    };
    return DeviceParameters;
}
