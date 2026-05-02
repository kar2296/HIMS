import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.NewAssetRequestInstance, i.NewAssetRequestAttributes> {
    let NewAssetRequest = sequelize.define<i.NewAssetRequestInstance, i.NewAssetRequestAttributes>('NewAssetRequest', {
        Id: { type: DataTypes.BIGINT, field: 'NewAssetRequestId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        AssetRequestTypeId: { type: DataTypes.BIGINT, field: 'AssetRequestTypeId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        IsManufacturer: { type: DataTypes.BOOLEAN, field: 'IsManufacturer' },
        Manufacturer: { type: DataTypes.STRING, field: 'Manufacturer' },
        IsPreferredSupplier: { type: DataTypes.BOOLEAN, field: 'IsPreferredSupplier' },
        PreferredSupplierId: { type: DataTypes.BIGINT, field: 'PreferredSupplierId' },
        PreferredSupplier: { type: DataTypes.STRING, field: 'PreferredSupplier' },
        ApproximateValue: { type: DataTypes.DECIMAL, field: 'ApproximateValue' },
        RequestedById: { type: DataTypes.BIGINT, field: 'RequestedById' },
        RequestedDate: { type: DataTypes.DATE, field: 'RequestedDate' },
        RequestedComments: { type: DataTypes.STRING, field: 'RequestedComments' },
        ApprovedById: { type: DataTypes.BIGINT, field: 'ApprovedById' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApprovedComments: { type: DataTypes.STRING, field: 'ApprovedComments' },
        RejectedById: { type: DataTypes.BIGINT, field: 'RejectedById' },
        RejectedDate: { type: DataTypes.DATE, field: 'RejectedDate' },
        RejectedComments: { type: DataTypes.STRING, field: 'RejectedComments' },
        CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
        CancelledById: { type: DataTypes.BIGINT, field: 'CancelledById' },
        CancelledComments: { type: DataTypes.STRING, field: 'CancelledComments' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        AssetRequestStatusId: { type: DataTypes.INTEGER, field: 'AssetRequestStatusId' },
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
            tableName: 'hims_newassetrequests',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (NewAssetRequest as any).associate = function (models: Models) {
        NewAssetRequest.belongsTo(models.Department, { as: 'Department', foreignKey: 'DepartmentId' });
        NewAssetRequest.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedById' });
        NewAssetRequest.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedById' });
        NewAssetRequest.belongsTo(models.ReferenceValue, { as: 'AssetRequestStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return NewAssetRequest;
}
