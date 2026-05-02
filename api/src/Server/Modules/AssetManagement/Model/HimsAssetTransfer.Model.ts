import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetTransferInstance, i.AssetTransferAttributes> {
    let AssetTransfer = sequelize.define<i.AssetTransferInstance, i.AssetTransferAttributes>('AssetTransfer', {
        Id: { type: DataTypes.BIGINT, field: 'AssetTransferId', primaryKey: true, autoIncrement: true },
        AssetTransferNo: { type: DataTypes.STRING, field: 'AssetTransferNo' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        FromDepartmentId: { type: DataTypes.BIGINT, field: 'FromDepartmentId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        FromFacilityId: { type: DataTypes.BIGINT, field: 'FromFacilityId' },
        TOFacilityId: { type: DataTypes.BIGINT, field: 'TOFacilityId' },
        ToDepartmentId: { type: DataTypes.BIGINT, field: 'ToDepartmentId' },
        AssetTransferId: { type: DataTypes.STRING, field: 'AssetTransferId' },
        RequestedById: { type: DataTypes.BIGINT, field: 'RequestedById' },
        ApprovedById: { type: DataTypes.BIGINT, field: 'ApprovedById' },
        RequestedDate: { type: DataTypes.DATE, field: 'RequestedDate' },
        Search: { type: DataTypes.STRING, field: 'Search' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        TransferedDate: { type: DataTypes.DATE, field: 'TransferedDate' },
        TransferedById: { type: DataTypes.BIGINT, field: 'TransferedById' },
        TransferId: { type: DataTypes.STRING, field: 'TransferId' },
        Purpose: { type: DataTypes.STRING, field: 'Purpose' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        AssetTransferStatusId: { type: DataTypes.INTEGER, field: 'AssetTransferStatusId' },
        ToUserId: { type: DataTypes.INTEGER, field: 'ToUserId' },
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
            tableName: 'hims_assettransfer',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AssetTransfer as any).associate = function (models: Models) {
        AssetTransfer.belongsTo(models.Asset);
        AssetTransfer.belongsTo(models.Department, { as: 'FromDepartment', foreignKey: 'FromDepartmentId' });
        AssetTransfer.belongsTo(models.Department, { as: 'ToDepartment', foreignKey: 'ToDepartmentId' });
        AssetTransfer.belongsTo(models.Asset, { foreignKey: 'AssetId' });
        AssetTransfer.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        AssetTransfer.belongsTo(models.User, { as: 'TransferedUser', foreignKey: 'TransferedById' });
        AssetTransfer.belongsTo(models.ReferenceValue, {
            as: 'AssetTransferStatus', foreignKey: 'AssetTransferStatusId', targetKey: 'ReferenceValueCodeId'
        });
        // AssetTransfer.belongsTo(models.ReferenceValue, { as: 'AssetType', targetKey: 'ReferenceValueCodeId' });
    };
    return AssetTransfer;
}
