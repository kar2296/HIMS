import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PurchaseReturnInstance, i.PurchaseReturnAttributes> {
    let PurchaseReturn = sequelize.define<i.PurchaseReturnInstance, i.PurchaseReturnAttributes>('PurchaseReturn', {
        PurchaseReturnId: { type: DataTypes.BIGINT, field: 'PurchaseReturnId', primaryKey: true, autoIncrement: true },
        PrnNumber: { type: DataTypes.STRING, field: 'PrnNumber' },
        PrnDate: { type: DataTypes.DATE, field: 'PrnDate' },
        PrnTypeId: { type: DataTypes.BIGINT, field: 'PrnTypeId' },
        PrnStatusId: { type: DataTypes.BIGINT, field: 'PrnStatusId' },
        ReturnReasonId: { type: DataTypes.BIGINT, field: 'ReturnReasonId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        StoreTypeId: { type: DataTypes.BIGINT, field: 'StoreTypeId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        ReturnTypeId: { type: DataTypes.BIGINT, field: 'ReturnTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        PurchaseOrderId: { type: DataTypes.BIGINT, field: 'PurchaseOrderId' },
        GrnId: { type: DataTypes.BIGINT, field: 'GrnId' },
        ReturnedBy: { type: DataTypes.INTEGER, field: 'ReturnedBy' },
        ReturnedDate: { type: DataTypes.DATE, field: 'ReturnedDate' },
        ReturnerComments: { type: DataTypes.STRING, field: 'ReturnerComments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        IsCanceled: { type: DataTypes.BOOLEAN, field: 'IsCancelled' },
        CancelReasonId: { type: DataTypes.BIGINT, field: 'CancelReasonId' },
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        TotalDiscountAmount: { type: DataTypes.DECIMAL, field: 'TotalDiscountAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        ShippingCharges: { type: DataTypes.DECIMAL, field: 'ShippingCharges' },
        OtherCharges: { type: DataTypes.DECIMAL, field: 'OtherCharges' },
        RoundOff: { type: DataTypes.DECIMAL, field: 'RoundOff' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        TotalReturnAmount: { type: DataTypes.DECIMAL, field: 'TotalReturnAmount' },
        TallyApprovedStatusId: { type: DataTypes.BIGINT, field: 'TallyApprovedStatusId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
		CancelledBy: { type: DataTypes.INTEGER, field: 'CancelledBy' },
        CancelledAt: { type: DataTypes.DATE, field: 'CancelledAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'purchasereturns',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PurchaseReturn as any).associate = function (models: Models) {
        PurchaseReturn.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PurchaseReturn.belongsTo(models.PurchaseOrder, { foreignKey: 'PurchaseOrderId' });
        PurchaseReturn.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        PurchaseReturn.belongsTo(models.Grn, { foreignKey: 'GrnId' });
        PurchaseReturn.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PurchaseReturn.belongsTo(models.User, { as: 'ReturnedUser', foreignKey: 'ReturnedBy' });
        PurchaseReturn.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        PurchaseReturn.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        PurchaseReturn.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        PurchaseReturn.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        PurchaseReturn.belongsTo(models.ReferenceValue, {
            as: 'PrnStatus', foreignKey: 'PrnStatusId',
            targetKey: 'ReferenceValueCodeId'
        });
        PurchaseReturn.belongsTo(models.ReferenceValue, {
            as: 'ReturnReason', foreignKey: 'ReturnReasonId',
            targetKey: 'ReferenceValueCodeId'
        });
        PurchaseReturn.belongsTo(models.ReferenceValue, {
            as: 'PrnType',
            foreignKey: 'PrnTypeId', targetKey: 'ReferenceValueCodeId'
        });
        PurchaseReturn.hasMany(models.PurchaseReturnDetail);
    };

    return PurchaseReturn;
}
