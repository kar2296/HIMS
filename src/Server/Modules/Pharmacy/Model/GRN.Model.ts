import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GrnInstance, i.GrnAttributes> {
    let Grn = sequelize.define<i.GrnInstance, i.GrnAttributes>('Grn', {
        Id: { type: DataTypes.BIGINT, field: 'GrnId', primaryKey: true, autoIncrement: true },
        GrnNumber: { type: DataTypes.STRING, field: 'GrnNumber' },
        GrnDate: { type: DataTypes.DATE, field: 'GrnDate' },
        GrnTypeId: { type: DataTypes.BIGINT, field: 'GrnTypeId' },
        GrnSubTypeId: { type: DataTypes.BIGINT, field: 'GrnSubTypeId' },
        GrnStatusId: { type: DataTypes.BIGINT, field: 'GrnStatusId' },
        PoStatusId: { type: DataTypes.BIGINT, field: 'PoStatusId' },
        SubmissionStatusId: { type: DataTypes.BIGINT, field: 'SubmissionStatusId' },
        PurchaseOrderId: { type: DataTypes.BIGINT, field: 'PurchaseOrderId' },
        PoNumber: { type: DataTypes.STRING, field: 'PoNumber' },
        PoDate: { type: DataTypes.DATE, field: 'PoDate' },
        PurchaseReturnId: { type: DataTypes.BIGINT, field: 'PurchaseReturnId' },
        PrnNumber: { type: DataTypes.STRING, field: 'PrnNumber' },
        PrnDate: { type: DataTypes.DATE, field: 'PrnDate' },
        IsGeneralGrn: { type: DataTypes.BOOLEAN, field: 'IsGeneralGrn' },
        IsGeneralPoGrn: { type: DataTypes.BOOLEAN, field: 'IsGeneralPoGrn' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        SubmittedBy: { type: DataTypes.INTEGER, field: 'SubmittedBy' },
        SubmittedDate: { type: DataTypes.DATE, field: 'SubmittedDate' },
        InvReceivedBy: { type: DataTypes.INTEGER, field: 'InvReceivedBy' },
        InvReceivedDate: { type: DataTypes.DATE, field: 'InvReceivedDate' },
        ReceivedBy: { type: DataTypes.INTEGER, field: 'ReceivedBy' },
        ReceivedDate: { type: DataTypes.DATE, field: 'ReceivedDate' },
        ReceiverComments: { type: DataTypes.STRING, field: 'ReceiverComments' },
        InvRejectedBy: { type: DataTypes.INTEGER, field: 'InvRejectedBy' },
        InvRejectedDate: { type: DataTypes.DATE, field: 'InvRejectedDate' },
        InvRejectedComments: { type: DataTypes.STRING, field: 'InvRejectedComments' },
        InvoiceNumber: { type: DataTypes.STRING, field: 'InvoiceNumber' },
        InvoiceDate: { type: DataTypes.DATE, field: 'InvoiceDate' },
        DcNumber: { type: DataTypes.STRING, field: 'DcNumber' },
        DcDate: { type: DataTypes.DATE, field: 'DcDate' },
        GpNumber: { type: DataTypes.STRING, field: 'GpNumber' },
        GpDate: { type: DataTypes.DATE, field: 'GpDate' },
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        Discount1: { type: DataTypes.DECIMAL, field: 'Discount1' },
        Discount2: { type: DataTypes.DECIMAL, field: 'Discount2' },
        GrnDiscount: { type: DataTypes.DECIMAL, field: 'GrnDiscount' },
        TotalDiscountAmount: { type: DataTypes.DECIMAL, field: 'TotalDiscountAmount' },
        TotalDiscount1Amount: { type: DataTypes.DECIMAL, field: 'TotalDiscount1Amount' },
        TotalDiscount2Amount: { type: DataTypes.DECIMAL, field: 'TotalDiscount2Amount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        TotalCreditAmount: { type: DataTypes.DECIMAL, field: 'TotalCreditAmount' },
        ShippingCharges: { type: DataTypes.DECIMAL, field: 'ShippingCharges' },
        OtherCharges: { type: DataTypes.DECIMAL, field: 'OtherCharges' },
        TransportCharges: { type: DataTypes.DECIMAL, field: 'TransportCharges' },
        OtherChargesGstId: { type: DataTypes.BIGINT, field: 'OtherChargesGstId' },
        OtherChargesGstPercentage: { type: DataTypes.DECIMAL, field: 'OtherChargesGstPercentage' },
        OtherChargesGstAmount: { type: DataTypes.DECIMAL, field: 'OtherChargesGstAmount' },
        TransportChargesGstId: { type: DataTypes.BIGINT, field: 'TransportChargesGstId' },
        TransportChargesGstPercentage: { type: DataTypes.DECIMAL, field: 'TransportChargesGstPercentage' },
        TransportChargesGstAmount: { type: DataTypes.DECIMAL, field: 'TransportChargesGstAmount' },
        RoundOff: { type: DataTypes.DECIMAL, field: 'RoundOff' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        ReceivedAmount: { type: DataTypes.DECIMAL, field: 'ReceivedAmount' },
        TaxAmount: { type: DataTypes.DECIMAL, field: 'TaxAmount' },
        WriteOff: { type: DataTypes.DECIMAL, field: 'WriteOff' },
        BalanceAmount: { type: DataTypes.DECIMAL, field: 'BalanceAmount' },
        TotalInvoiceAmount: { type: DataTypes.DECIMAL, field: 'TotalInvoiceAmount' },
        VendorFacilityMapId: { type: DataTypes.BIGINT, field: 'VendorFacilityMapId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        CancelReasonId: { type: DataTypes.BIGINT, field: 'CancelReasonId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        IsOpenGRN: { type: DataTypes.BOOLEAN, field: 'IsOpenGRN' },
        IsCredit: { type: DataTypes.BOOLEAN, field: 'IsCredit' },
        IsConsignment: { type: DataTypes.BOOLEAN, field: 'IsConsignment' },
        IsConsignmentPO: { type: DataTypes.BOOLEAN, field: 'IsConsignmentPO' },
        IsConsignmentDC: { type: DataTypes.BOOLEAN, field: 'IsConsignmentDC' },
        IsConvertionQtyEdit: { type: DataTypes.BOOLEAN, field: 'IsConvertionQtyEdit' },
        IsPaidFully: { type: DataTypes.BOOLEAN, field: 'IsPaidFully' },
        IsStockTransferred: { type: DataTypes.BOOLEAN, field: 'IsStockTransferred' },
        RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
        TallyApprovedStatusId: { type: DataTypes.BIGINT, field: 'TallyApprovedStatusId' },
        PaymentTermsId: { type: DataTypes.BIGINT, field: 'PaymentTermsId' },
        PANNo: { type: DataTypes.INTEGER, field: 'PANNo' },
        GSTNo: { type: DataTypes.INTEGER, field: 'GSTNo' },
        TANNo: { type: DataTypes.INTEGER, field: 'TANNo' },
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
            tableName: 'grns',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Grn as any).associate = function (models: Models) {
        Grn.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        Grn.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        Grn.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        Grn.belongsTo(models.ReferenceValue, { as: 'GrnStatus', targetKey: 'ReferenceValueCodeId' });
        Grn.belongsTo(models.ReferenceValue, {
            as: 'ClaimSubmissionStatus', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'SubmissionStatusId'
        });
        Grn.belongsTo(models.ReferenceValue, { as: 'GrnType', targetKey: 'ReferenceValueCodeId' });
        Grn.belongsTo(models.ReferenceValue, { as: 'GrnSubType', targetKey: 'ReferenceValueCodeId' });
        Grn.hasMany(models.GrnDetail);
        Grn.belongsTo(models.PurchaseOrder, { foreignKey: 'PurchaseOrderId' });
        Grn.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        Grn.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
        Grn.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        Grn.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        Grn.belongsTo(models.User, { as: 'SubmittedUser', foreignKey: 'SubmittedBy' });
        Grn.belongsTo(models.User, { as: 'ReceivedUser', foreignKey: 'InvReceivedBy' });
        Grn.belongsTo(models.User, { as: 'RejectedUser', foreignKey: 'InvRejectedBy' });
    };

    return Grn;
}
