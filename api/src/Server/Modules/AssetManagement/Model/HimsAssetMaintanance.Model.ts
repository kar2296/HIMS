import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetMaintananceInstance, i.AssetMaintananceAttributes> {
    let AssetMaintanance = sequelize.define<i.AssetMaintananceInstance, i.AssetMaintananceAttributes>('AssetMaintanance', {
        Id: { type: DataTypes.BIGINT, field: 'AssetMaintananceId', primaryKey: true, autoIncrement: true },
        EventDate: { type: DataTypes.DATE, field: 'EventDate' },
        EventDescription: { type: DataTypes.STRING, field: 'EventDescription' },
        MaintananceDate: { type: DataTypes.DATE, field: 'MaintananceDate' },
        PerformedBy: { type: DataTypes.STRING, field: 'PerformedBy' },
        MaintananceDescription: { type: DataTypes.STRING, field: 'MaintananceDescription' },
        Cost: { type: DataTypes.DECIMAL, field: 'Cost' },
        TotalMaintananceId: { type: DataTypes.BIGINT, field: 'TotalMaintananceId' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CompleteId: { type: DataTypes.BIGINT, field: 'CompleteId' },
        PendingId: { type: DataTypes.BIGINT, field: 'PendingId' },
        NextSchedule: { type: DataTypes.DATE, field: 'NextSchedule' },
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
            tableName: 'hims_assetmaintanance',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AssetMaintanance as any).associate = function (models: Models) {
        AssetMaintanance.belongsTo(models.Asset, { foreignKey: 'AssetId' });
    };

    return AssetMaintanance;
}
