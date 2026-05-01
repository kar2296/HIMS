import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockTransferInstance, i.StockTransferAttributes> {
    let StockTransfer = sequelize.define<i.StockTransferInstance, i.StockTransferAttributes>('StockTransfer', {
        Id: { type: DataTypes.BIGINT, field: 'StockTransferId', primaryKey: true, autoIncrement: true },
        StockRequestId: { type: DataTypes.BIGINT, field: 'StockRequestId' },
        TransferNumber: { type: DataTypes.STRING, field: 'TransferNumber' },
        RequestNumber: { type: DataTypes.STRING, field: 'RequestNumber' },
        AcceptanceNumber: { type: DataTypes.STRING, field: 'AcceptanceNumber' },
        TransferDate: { type: DataTypes.DATE, field: 'TransferDate' },
        TransferTypeId: { type: DataTypes.BIGINT, field: 'TransferTypeId' },
        TransferSubTypeId: { type: DataTypes.BIGINT, field: 'TransferSubTypeId' },
        TransferStatusId: { type: DataTypes.BIGINT, field: 'TransferStatusId' },
        AcceptanceStatusId: { type: DataTypes.BIGINT, field: 'AcceptanceStatusId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        ToStoreMasterId: { type: DataTypes.BIGINT, field: 'ToStoreMasterId' },
        ToStoreName: { type: DataTypes.STRING, field: 'ToStoreName' },
        ItemCategoryId: { type: DataTypes.BIGINT, field: 'ItemCategoryId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ToFacilityId: { type: DataTypes.BIGINT, field: 'ToFacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        TotalDiscountAmount: { type: DataTypes.DECIMAL, field: 'TotalDiscountAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        OtherCharges: { type: DataTypes.DECIMAL, field: 'OtherCharges' },
        RoundOff: { type: DataTypes.DECIMAL, field: 'RoundOff' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        CancelReasonId: { type: DataTypes.BIGINT, field: 'CancelReasonId' },
        RequestedBy: { type: DataTypes.INTEGER, field: 'RequestedBy' },
        RequestedDate: { type: DataTypes.DATE, field: 'RequestedDate' },
        RequesterComments: { type: DataTypes.STRING, field: 'RequesterComments' },
        TransferedBy: { type: DataTypes.INTEGER, field: 'TransferedBy' },
        TransferedDate: { type: DataTypes.DATE, field: 'TransferedDate' },
        TransfererComments: { type: DataTypes.STRING, field: 'TransfererComments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        CancelledBy: { type: DataTypes.INTEGER, field: 'CancelledBy' },
        CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
        CancelledComments: { type: DataTypes.STRING, field: 'CancelledComments' },
        AcceptedBy: { type: DataTypes.INTEGER, field: 'AcceptedBy' },
        AcceptedDate: { type: DataTypes.DATE, field: 'AcceptedDate' },
        AccepterComments: { type: DataTypes.STRING, field: 'AccepterComments' },
        GrnId: { type: DataTypes.BIGINT, field: 'GrnId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'stocktransfers',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockTransfer as any).associate = function (models: Models) {
        StockTransfer.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        StockTransfer.belongsTo(models.StoreMaster, { as: 'FromStore', foreignKey: 'StoreMasterId' });
        StockTransfer.belongsTo(models.StoreMaster, { as: 'ToStore', foreignKey: 'ToStoreMasterId' });
        StockTransfer.belongsTo(models.ReferenceValue, { as: 'AcceptanceStatus', targetKey: 'ReferenceValueCodeId' });
        StockTransfer.belongsTo(models.ReferenceValue, { as: 'TransferStatus', targetKey: 'ReferenceValueCodeId' });
        StockTransfer.belongsTo(models.ReferenceValue, { as: 'TransferType', targetKey: 'ReferenceValueCodeId' });
        StockTransfer.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedBy' });
        StockTransfer.belongsTo(models.User, { as: 'TranferedUser', foreignKey: 'TransferedBy' });
        StockTransfer.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        StockTransfer.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        StockTransfer.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        StockTransfer.belongsTo(models.StockRequest, { foreignKey: 'StockRequestId' });
        StockTransfer.hasMany(models.StockTransferDetail);
    };

    return StockTransfer;
}
