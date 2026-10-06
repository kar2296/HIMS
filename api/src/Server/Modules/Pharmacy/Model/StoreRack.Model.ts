import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StoreRackInstance, i.StoreRackAttributes> {
    let StoreRack = sequelize.define<i.StoreRackInstance, i.StoreRackAttributes>('StoreRack', {
        Id: { type: DataTypes.BIGINT, field: 'StoreRackId', primaryKey: true, autoIncrement: true },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreCode: { type: DataTypes.STRING, field: 'StoreCode' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        RackId: { type: DataTypes.BIGINT, field: 'RackId' },
        RackCode: { type: DataTypes.STRING, field: 'RackCode' },
        RackName: { type: DataTypes.STRING, field: 'RackName' },
        RackDescription: { type: DataTypes.STRING, field: 'RackDescription' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'storeracks',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StoreRack as any).associate = function (models: Models) {
        StoreRack.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        StoreRack.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        StoreRack.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };

    return StoreRack;
}
