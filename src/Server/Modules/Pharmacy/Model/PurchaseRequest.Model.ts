import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PurchaseRequestInstance, i.PurchaseRequestAttributes> {
    let PurchaseRequest = sequelize.define<i.PurchaseRequestInstance, i.PurchaseRequestAttributes>('PurchaseRequest', {
        Id: { type: DataTypes.BIGINT, field: 'PurchaseRequestId', primaryKey: true, autoIncrement: true },
        PrNumber: { type: DataTypes.STRING, field: 'PrNumber' },
        PrTypeId: { type: DataTypes.BIGINT, field: 'PrTypeId' },
        VendorFacilityMapId: { type: DataTypes.BIGINT, field: 'VendorFacilityMapId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        ToStoreMasterId: { type: DataTypes.BIGINT, field: 'ToStoreMasterId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
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
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        TotalDiscountAmount: { type: DataTypes.DECIMAL, field: 'TotalDiscountAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        ExpectedDeliveryDate: { type: DataTypes.DATE, field: 'ExpectedDeliveryDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PrStatusId: { type: DataTypes.INTEGER, field: 'PrStatusId' },
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
            tableName: 'purchaserequests',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PurchaseRequest as any).associate = function (models: Models) {
        PurchaseRequest.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PurchaseRequest.belongsTo(models.StoreMaster, { as: 'FromStore', foreignKey: 'StoreMasterId' });
        PurchaseRequest.belongsTo(models.StoreMaster, { as: 'ToStore', foreignKey: 'ToStoreMasterId' });
        PurchaseRequest.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        PurchaseRequest.belongsTo(models.ReferenceValue, { as: 'PrStatus', targetKey: 'ReferenceValueCodeId' });
        PurchaseRequest.belongsTo(models.ReferenceValue, { as: 'PrType', targetKey: 'ReferenceValueCodeId' });
        PurchaseRequest.hasMany(models.PurchaseRequestDetail);
        PurchaseRequest.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedBy' });
        PurchaseRequest.belongsTo(models.User, { as: 'Created', foreignKey: 'CreatedBy' });
        PurchaseRequest.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        PurchaseRequest.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        PurchaseRequest.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        PurchaseRequest.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PurchaseRequest.belongsTo(models.StoreMaster, { as: 'StoreName', foreignKey: 'StoreMasterId' });
    };

    return PurchaseRequest;
}
