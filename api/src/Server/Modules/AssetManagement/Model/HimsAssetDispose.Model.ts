import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetDisposeInstance, i.AssetDisposeAttributes> {
    let AssetDispose = sequelize.define<i.AssetDisposeInstance, i.AssetDisposeAttributes>('AssetDispose', {
        Id: { type: DataTypes.BIGINT, field: 'AssetDisposeId', primaryKey: true, autoIncrement: true },
        DisposeGroupId: { type: DataTypes.BIGINT, field: 'DisposeGroupId' },
        DisposeTypeId: { type: DataTypes.BIGINT, field: 'DisposeTypeId' },
        DisposeTypeName: { type: DataTypes.STRING, field: 'DisposeTypeName' },
        DisposeTypeValue: { type: DataTypes.BOOLEAN, field: 'DisposeTypeValue' },
        DisposeStatusId: { type: DataTypes.BIGINT, field: 'DisposeStatusId' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        AssetTypeId: { type: DataTypes.BIGINT, field: 'AssetTypeId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        VendorId: { type: DataTypes.BIGINT, field: 'VendorId' },
        ReasonForNotification: { type: DataTypes.STRING, field: 'ReasonForNotification' },
        RequestedBy: { type: DataTypes.BIGINT, field: 'RequestedBy' },
        RequestedDate: { type: DataTypes.DATE, field: 'RequestedDate' },
        ApprovedBy: { type: DataTypes.BIGINT, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        AccessmentBy: { type: DataTypes.BIGINT, field: 'AccessmentBy' },
        AccessmentDate: { type: DataTypes.DATE, field: 'AccessmentDate' },
        AccessmentComments: { type: DataTypes.STRING, field: 'AccessmentComments' },
        AccessmentApprovedBy: { type: DataTypes.BIGINT, field: 'AccessmentApprovedBy' },
        IsCommunicatetoUsers: { type: DataTypes.BOOLEAN, field: 'IsCommunicatetoUsers' },
        IsEraseConfidentialInformation: { type: DataTypes.BOOLEAN, field: 'IsEraseConfidentialInformation' },
        IsRemoveAnySoftware: { type: DataTypes.BOOLEAN, field: 'IsRemoveAnySoftware' },
        IsSafelyRemovefromService: { type: DataTypes.BOOLEAN, field: 'IsSafelyRemovefromService' },
        IsTransfertoSafeandSecureStorage: { type: DataTypes.BOOLEAN, field: 'IsTransfertoSafeandSecureStorage' },
        IsUpdateCondemnationDatabase: { type: DataTypes.BOOLEAN, field: 'IsUpdateCondemnationDatabase' },
        DisposeMethodId: { type: DataTypes.BIGINT, field: 'DisposeMethodId' },
        DisposeCost: { type: DataTypes.STRING, field: 'DisposeCost' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        VendorDetails: { type: DataTypes.STRING, field: 'VendorDetails' },
        DisposedBy: { type: DataTypes.INTEGER, field: 'DisposedBy' },
        DisposedDate: { type: DataTypes.DATE, field: 'DisposedDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'hims_assetdispose',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AssetDispose as any).associate = function (models: Models) {
        AssetDispose.belongsTo(models.ReferenceValue,
            { foreignKey: 'DisposeTypeId', as: 'DisposeType', targetKey: 'ReferenceValueCodeId' });
        AssetDispose.belongsTo(models.ReferenceValue,
            { foreignKey: 'DisposeStatusId', as: 'DisposeStatus', targetKey: 'ReferenceValueCodeId' });
        AssetDispose.belongsTo(models.ReferenceValue,
            { foreignKey: 'DisposeMethodId', as: 'DisposeMethod', targetKey: 'ReferenceValueCodeId' });
        AssetDispose.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        AssetDispose.belongsTo(models.VendorMaster, { foreignKey: 'VendorId' });
        AssetDispose.belongsTo(models.Asset, { foreignKey: 'AssetId' });
        AssetDispose.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedBy' });
        AssetDispose.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
    };
    return AssetDispose;
}
