import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetAccessoriesInstance, i.AssetAccessoriesAttributes> {
    let AssetAccessories = sequelize.define<i.AssetAccessoriesInstance, i.AssetAccessoriesAttributes>('AssetAccessories', {
        Id: { type: DataTypes.BIGINT, field: 'AssetAccessoriesId', primaryKey: true, autoIncrement: true },
        AccessoriesName: { type: DataTypes.STRING, field: 'AccessoriesName' },
        SerialNO: { type: DataTypes.STRING, field: 'SerialNO' },
        WarrentyFrom: { type: DataTypes.DATE, field: 'WarrentyFrom' },
        WarrentyTo: { type: DataTypes.DATE, field: 'WarrentyTo' },
        AssetAccessoriesId: { type: DataTypes.BIGINT, field: 'AssetAccessoriesId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        Department: { type: DataTypes.STRING, field: 'Department' },
        PO: { type: DataTypes.DATE, field: 'PO' },
        Cost: { type: DataTypes.DECIMAL, field: 'Cost' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
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
            tableName: 'hims_assetaccessories',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
    (AssetAccessories as any).associate = function (models: Models) {
        AssetAccessories.belongsTo(models.Asset, { foreignKey: 'AssetId' });
    };

    return AssetAccessories;
}
