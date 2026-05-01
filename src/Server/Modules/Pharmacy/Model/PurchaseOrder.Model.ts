import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PurchaseOrderInstance, i.PurchaseOrderAttributes> {
    let PurchaseOrder = sequelize.define<i.PurchaseOrderInstance, i.PurchaseOrderAttributes>('PurchaseOrder', {
        PurchaseOrderId: { type: DataTypes.BIGINT, field: 'PurchaseOrderId', primaryKey: true, autoIncrement: true },
        PoNumber: { type: DataTypes.STRING, field: 'PoNumber' },
        PoDate: { type: DataTypes.DATE, field: 'PoDate' },
        PrNumber: { type: DataTypes.STRING, field: 'PrNumber' },
        PrDate: { type: DataTypes.DATE, field: 'PrDate' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        DeliveryStoreMasterId: { type: DataTypes.BIGINT, field: 'DeliveryStoreMasterId' },
        DeliveryStoreName: { type: DataTypes.STRING, field: 'DeliveryStoreName' },
        DeliveryDate: { type: DataTypes.DATE, field: 'DeliveryDate' },
        IsOpenPO: { type: DataTypes.BOOLEAN, field: 'IsOpenPO' },
        DcDate: { type: DataTypes.DATE, field: 'DcDate' },
        DcNumber: { type: DataTypes.STRING, field: 'DcNumber' },
        IsGeneralPo: { type: DataTypes.BOOLEAN, field: 'IsGeneralPo' },
        PoTypeId: { type: DataTypes.BIGINT, field: 'PoTypeId' },
        PoSubTypeId: { type: DataTypes.BIGINT, field: 'PoSubTypeId' },
        PoStatusId: { type: DataTypes.BIGINT, field: 'PoStatusId' },
        VendorFacilityMapId: { type: DataTypes.BIGINT, field: 'VendorFacilityMapId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        FromFacilityId: { type: DataTypes.BIGINT, field: 'FromFacilityId' },
        ToFacilityId: { type: DataTypes.BIGINT, field: 'ToFacilityId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        IsConsignment: { type: DataTypes.BOOLEAN, field: 'IsConsignment' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        PaymentTermsId: { type: DataTypes.BIGINT, field: 'PaymentTermsId' },
        PurchaseRequestId: { type: DataTypes.BIGINT, field: 'PurchaseRequestId' },
        RequestedBy: { type: DataTypes.INTEGER, field: 'RequestedBy' },
        RequestedDate: { type: DataTypes.DATE, field: 'RequestedDate' },
        RequesterComments: { type: DataTypes.STRING, field: 'RequesterComments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        AmendedBy: { type: DataTypes.INTEGER, field: 'AmendedBy' },
        AmendedDate: { type: DataTypes.DATE, field: 'AmendedDate' },
        AmenderComments: { type: DataTypes.STRING, field: 'AmenderComments' },
        CancelledBy: { type: DataTypes.INTEGER, field: 'CancelledBy' },
        CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
        CancelledComments: { type: DataTypes.STRING, field: 'CancelledComments' },
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        TotalDiscountAmount: { type: DataTypes.DECIMAL, field: 'TotalDiscountAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        OtherCharges: { type: DataTypes.DECIMAL, field: 'OtherCharges' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        TotalSaleAmount: { type: DataTypes.DECIMAL, field: 'TotalSaleAmount' },
        RoundOff: { type: DataTypes.DECIMAL, field: 'RoundOff' },
        TotalProfitAmount: { type: DataTypes.DECIMAL, field: 'TotalProfitAmount' },
        ValidUntillDate: { type: DataTypes.DATE, field: 'ValidUntillDate' },
        LeviesandTaxes: { type: DataTypes.STRING, field: 'LeviesandTaxes' },
        DeliverySchedule: { type: DataTypes.STRING, field: 'DeliverySchedule' },
        TermsofDispatch: { type: DataTypes.STRING, field: 'TermsofDispatch' },
        TermsofPayment: { type: DataTypes.STRING, field: 'TermsofPayment' },
        Discount1: { type: DataTypes.DECIMAL, field: 'Discount1' },
        Discount2: { type: DataTypes.DECIMAL, field: 'Discount2' },
        TotalDiscount1Amount: { type: DataTypes.DECIMAL, field: 'TotalDiscount1Amount' },
        TotalDiscount2Amount: { type: DataTypes.DECIMAL, field: 'TotalDiscount2Amount' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        AddressLine3: { type: DataTypes.STRING, field: 'AddressLine3' },
        TransportCharges: { type: DataTypes.DECIMAL, field: 'TransportCharges' },
        OtherChargesGstId: { type: DataTypes.BIGINT, field: 'OtherChargesGstId' },
        OtherChargesGstPercentage: { type: DataTypes.DECIMAL, field: 'OtherChargesGstPercentage' },
        OtherChargesGstAmount: { type: DataTypes.DECIMAL, field: 'OtherChargesGstAmount' },
        TransportChargesGstId: { type: DataTypes.BIGINT, field: 'TransportChargesGstId' },
        TransportChargesGstPercentage: { type: DataTypes.DECIMAL, field: 'TransportChargesGstPercentage' },
        TransportChargesGstAmount: { type: DataTypes.DECIMAL, field: 'TransportChargesGstAmount' },
        PANNo: { type: DataTypes.INTEGER, field: 'PANNo' },
        GSTNo: { type: DataTypes.INTEGER, field: 'GSTNo' },
        TANNo: { type: DataTypes.INTEGER, field: 'TANNo' },
        Attachment: { type: DataTypes.STRING, field: 'Attachment' },
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
            tableName: 'purchaseorders',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PurchaseOrder as any).associate = function (models: Models) {
        PurchaseOrder.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PurchaseOrder.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PurchaseOrder.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        PurchaseOrder.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PurchaseOrder.belongsTo(models.Facility, { as: 'FromFacility', foreignKey: 'FromFacilityId' });
        PurchaseOrder.belongsTo(models.Facility, { as: 'ToFacility', foreignKey: 'ToFacilityId' });
        PurchaseOrder.belongsTo(models.StoreMaster, { as: 'StoreMaster', foreignKey: 'StoreMasterId' });
        PurchaseOrder.belongsTo(models.StoreMaster, { as: 'FromStore', foreignKey: 'StoreMasterId' });
        PurchaseOrder.belongsTo(models.StoreMaster, { as: 'ToStore', foreignKey: 'DeliveryStoreMasterId' });
        PurchaseOrder.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        PurchaseOrder.belongsTo(models.ReferenceValue, { as: 'PoStatus', targetKey: 'ReferenceValueCodeId' });
        PurchaseOrder.belongsTo(models.ReferenceValue, { as: 'PoType', targetKey: 'ReferenceValueCodeId' });
        PurchaseOrder.belongsTo(models.ReferenceValue, { as: 'PaymentTerms', targetKey: 'ReferenceValueCodeId' });
        PurchaseOrder.hasMany(models.PurchaseOrderDetail);
        PurchaseOrder.hasMany(models.Grn);
        PurchaseOrder.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedBy' });
        PurchaseOrder.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PurchaseOrder.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        PurchaseOrder.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        PurchaseOrder.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
    };

    return PurchaseOrder;
}
