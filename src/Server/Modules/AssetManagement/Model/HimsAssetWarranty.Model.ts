import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetWarrantyInstance, i.AssetWarrantyAttributes> {
    let AssetWarranty = sequelize.define<i.AssetWarrantyInstance, i.AssetWarrantyAttributes>('AssetWarranty', {
        Id: { type: DataTypes.BIGINT, field: 'AssetWarrantyId', primaryKey: true, autoIncrement: true },
        AssetId: { type: DataTypes.INTEGER, field: 'AssetId' },
        WarrantyTypeId: { type: DataTypes.INTEGER, field: 'WarrantyTypeId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        NoOfFreeServices: { type: DataTypes.INTEGER, field: 'NoOfFreeServices' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DepartmentName: { type: DataTypes.STRING, field: 'DepartmentName' },
        NoOfPendingServices: { type: DataTypes.INTEGER, field: 'NoOfPendingServices' },
        FromDate: { type: DataTypes.DATE, field: 'FromDate' },
        ToDate: { type: DataTypes.DATE, field: 'ToDate' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        CostValue: { type: DataTypes.DECIMAL, field: 'CostValue' },
        ReferenceNumber: { type: DataTypes.STRING, field: 'ReferenceNumber' },
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
            tableName: 'hims_assetwarranty',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AssetWarranty as any).associate = function (models: Models) {
        AssetWarranty.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        AssetWarranty.belongsTo(models.ReferenceValue, { as: 'WarrantyType', targetKey: 'ReferenceValueCodeId' });
        AssetWarranty.belongsTo(models.Asset, { foreignKey: 'AssetId' });
        AssetWarranty.belongsTo(models.Department);
    };
    return AssetWarranty;
}
