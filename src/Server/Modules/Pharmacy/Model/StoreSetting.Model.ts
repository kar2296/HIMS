import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StoreSettingInstance, i.StoreSettingAttributes> {
    let StoreSetting = sequelize.define<i.StoreSettingInstance, i.StoreSettingAttributes>('StoreSetting', {
        Id: { type: DataTypes.BIGINT, field: 'StoreSettingId', primaryKey: true, autoIncrement: true },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CanStockTransferTo: { type: DataTypes.STRING, field: 'CanStockTransferTo' },
        CanStockReturnTo: { type: DataTypes.STRING, field: 'CanStockReturnTo' },
        Register: { type: DataTypes.BOOLEAN, field: 'Register' },
        Pick: { type: DataTypes.BOOLEAN, field: 'Pick' },
        Allocate: { type: DataTypes.BOOLEAN, field: 'Allocate' },
        Dispense: { type: DataTypes.BOOLEAN, field: 'Dispense' },
        AllocateANDDispense: { type: DataTypes.BOOLEAN, field: 'AllocateANDDispense' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'storesettings',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return StoreSetting;
}
