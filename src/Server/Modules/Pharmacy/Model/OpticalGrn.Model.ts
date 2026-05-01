import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OpticalGrnInstance, i.OpticalGrnAttributes> {
    let OpticalGrn = sequelize.define<i.OpticalGrnInstance, i.OpticalGrnAttributes>('OpticalGrn', {
        OpticalGrnId: { type: DataTypes.BIGINT, field: 'OpticalGrnId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OpticalGrnNumber: { type: DataTypes.STRING, field: 'OpticalGrnNumber' },
        OpticalGrnDate: { type: DataTypes.DATE, field: 'OpticalGrnDate' },
        OpticalGrnTypeId: { type: DataTypes.BIGINT, field: 'OpticalGrnTypeId' },
        OpticalGrnStatusId: { type: DataTypes.BIGINT, field: 'OpticalGrnStatusId' },
        OpticalPurchaseOrderId: { type: DataTypes.BIGINT, field: 'OpticalPurchaseOrderId' },
        OpticalPONumber: { type: DataTypes.STRING, field: 'OpticalPONumber' },
        OpticalPODate: { type: DataTypes.DATE, field: 'OpticalPODate' },
        OpticalPurchaseReturnId: { type: DataTypes.BIGINT, field: 'OpticalPurchaseReturnId' },
        OpticalPRNumber: { type: DataTypes.STRING, field: 'OpticalPRNumber' },
        OpticalPRDate: { type: DataTypes.DATE, field: 'OpticalPRDate' },
        VendorFacilityMapId: { type: DataTypes.BIGINT, field: 'VendorFacilityMapId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        InvoiceNumber: { type: DataTypes.STRING, field: 'InvoiceNumber' },
        InvoiceDate: { type: DataTypes.DATE, field: 'InvoiceDate' },
        DcNumber: { type: DataTypes.STRING, field: 'DcNumber' },
        DcDate: { type: DataTypes.DATE, field: 'DcDate' },
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        GrnDiscount: { type: DataTypes.DECIMAL, field: 'GrnDiscount' },
        TotalDiscountAmount: { type: DataTypes.DECIMAL, field: 'TotalDiscountAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        ShippingCharges: { type: DataTypes.DECIMAL, field: 'ShippingCharges' },
        OtherCharges: { type: DataTypes.DECIMAL, field: 'OtherCharges' },
        RoundOff: { type: DataTypes.DECIMAL, field: 'RoundOff' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        TotalInvoiceAmount: { type: DataTypes.DECIMAL, field: 'TotalInvoiceAmount' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        IsOpenGRN: { type: DataTypes.BOOLEAN, field: 'IsOpenGRN' },
        IsCredit: { type: DataTypes.BOOLEAN, field: 'IsCredit' },
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
            tableName: 'opticalgrns',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (OpticalGrn as any).associate = function (models: Models) {
        OpticalGrn.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        OpticalGrn.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        OpticalGrn.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        OpticalGrn.belongsTo(models.ReferenceValue, { as: 'OpticalGrnStatus', targetKey: 'ReferenceValueCodeId' });
        OpticalGrn.belongsTo(models.ReferenceValue, { as: 'OpticalGrnType', targetKey: 'ReferenceValueCodeId' });
        OpticalGrn.hasMany(models.OpticalGrnDetail);
        //OpticalGrn.belongsTo(models.PurchaseOrder, { foreignKey: 'PurchaseOrderId' });
        OpticalGrn.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        OpticalGrn.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        OpticalGrn.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
    };
    return OpticalGrn;
}
