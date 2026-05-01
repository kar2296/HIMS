import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockRequestInstance, i.StockRequestAttributes> {
    let StockRequest = sequelize.define<i.StockRequestInstance, i.StockRequestAttributes>('StockRequest', {
        Id: { type: DataTypes.BIGINT, field: 'StockRequestId', primaryKey: true, autoIncrement: true },
        StockTransferId: { type: DataTypes.STRING, field: 'StockTransferId' },
        RequestNumber: { type: DataTypes.BIGINT, field: 'RequestNumber' },
        TransferNumber: { type: DataTypes.BIGINT, field: 'TransferNumber' },
        StockRequestTypeId: { type: DataTypes.BIGINT, field: 'StockRequestTypeId' },
        RequestSubTypeId: { type: DataTypes.BIGINT, field: 'RequestSubTypeId' },
        StockPriorityId: { type: DataTypes.BIGINT, field: 'StockPriorityId' },
        ItemCategoryId: { type: DataTypes.BIGINT, field: 'ItemCategoryId' },
        RequestStatusId: { type: DataTypes.BIGINT, field: 'RequestStatusId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        ToStoreMasterId: { type: DataTypes.BIGINT, field: 'ToStoreMasterId' },
        ToStoreName: { type: DataTypes.BIGINT, field: 'ToStoreName' },
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
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        CancelledBy: { type: DataTypes.INTEGER, field: 'CancelledBy' },
        CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
        CancelledComments: { type: DataTypes.STRING, field: 'CancelledComments' },
        TransferedBy: { type: DataTypes.INTEGER, field: 'TransferedBy' },
        TransferedDate: { type: DataTypes.DATE, field: 'TransferedDate' },
        TransfererComments: { type: DataTypes.STRING, field: 'TransfererComments' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
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
            tableName: 'stockrequests',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockRequest as any).associate = function (models: Models) {
        StockRequest.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        StockRequest.belongsTo(models.Facility, { as: 'ToFacility', foreignKey: 'ToFacilityId' });
        StockRequest.belongsTo(models.StoreMaster, { as: 'FromStore', foreignKey: 'StoreMasterId' });
        StockRequest.belongsTo(models.StoreMaster, { as: 'ToStore', foreignKey: 'ToStoreMasterId' });
        StockRequest.belongsTo(models.ReferenceValue, { as: 'RequestStatus', targetKey: 'ReferenceValueCodeId' });
        StockRequest.belongsTo(models.ReferenceValue, { as: 'StockRequestType', targetKey: 'ReferenceValueCodeId' });
        StockRequest.belongsTo(models.ReferenceValue, { as: 'StockPriority', targetKey: 'ReferenceValueCodeId' });
        StockRequest.belongsTo(models.ReferenceValue, { as: 'ItemCategory', targetKey: 'ReferenceValueCodeId' });
        StockRequest.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedBy' });
        StockRequest.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        StockRequest.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        StockRequest.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        StockRequest.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        StockRequest.belongsTo(models.User, { as: 'TransferedUser', foreignKey: 'TransferedBy' });
        StockRequest.hasMany(models.StockRequestDetail);
    };

    return StockRequest;
}
