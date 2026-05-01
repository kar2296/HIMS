import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetAuditDetailInstance, i.AssetAuditDetailAttributes> {
    let AssetAuditDetail = sequelize.define<i.AssetAuditDetailInstance, i.AssetAuditDetailAttributes>('AssetAuditDetail', {
        Id: { type: DataTypes.BIGINT, field: 'AssetAuditDetailId', primaryKey: true, autoIncrement: true },
        AssetAuditId: { type: DataTypes.STRING, field: 'AssetAuditId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        AssetTypeId: { type: DataTypes.STRING, field: 'AssetTypeId' },
        Serial: { type: DataTypes.STRING, field: 'Serial' },
        ModelNum: { type: DataTypes.STRING, field: 'ModelNum' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        ExpectedQuantity: { type: DataTypes.INTEGER, field: 'ExpectedQuantity' },
        ReconcileQuantity: { type: DataTypes.INTEGER, field: 'ReconcileQuantity' },
        ManufacturerId: { type: DataTypes.STRING, field: 'ManufacturerId' },
        DepartmentId: { type: DataTypes.STRING, field: 'DepartmentId' },
        LOCATIONId: { type: DataTypes.INTEGER, field: 'LOCATIONId' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        AuditStatusId: { type: DataTypes.BIGINT, field: 'AuditStatusId' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
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
            tableName: 'hims_assetauditdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AssetAuditDetail as any).associate = function (models: Models) {
        AssetAuditDetail.belongsTo(models.AssetAudit, { foreignKey: 'AssetAuditId' });
        AssetAuditDetail.belongsTo(models.Asset, { foreignKey: 'AssetId' });
        AssetAuditDetail.belongsTo(models.LocationMaster, { foreignKey: 'LOCATIONId' });
        AssetAuditDetail.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
        AssetAuditDetail.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        AssetAuditDetail.belongsTo(models.ReferenceValue, { as: 'LOCATION', targetKey: 'ReferenceValueCodeId' });
        AssetAuditDetail.belongsTo(models.ReferenceValue, { as: 'AuditStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return AssetAuditDetail;
}
