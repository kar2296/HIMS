import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemMasterInstance, i.ItemMasterAttributes> {
    let ItemMaster = sequelize.define<i.ItemMasterInstance, i.ItemMasterAttributes>('ItemMaster', {
        Id: { type: DataTypes.BIGINT, field: 'ItemMasterId', primaryKey: true, autoIncrement: true },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        ItemDescription: { type: DataTypes.STRING, field: 'ItemDescription' },
        ItemShortDescription: { type: DataTypes.STRING, field: 'ItemShortDescription' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        SubTypeId: { type: DataTypes.BIGINT, field: 'SubTypeId' },
        CategorySubId: { type: DataTypes.INTEGER, field: 'CategorySubId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        SubProductTypeId: { type: DataTypes.BIGINT, field: 'SubProductTypeId' },
        ImplantTypeId: { type: DataTypes.BIGINT, field: 'ImplantTypeId' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        GenericCode: { type: DataTypes.STRING, field: 'GenericCode' },
        GenericName: { type: DataTypes.STRING, field: 'GenericName' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        ManufacturerCode: { type: DataTypes.STRING, field: 'ManufacturerCode' },
        ManufacturerName: { type: DataTypes.STRING, field: 'ManufacturerName' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        NoOfTransactions: { type: DataTypes.STRING, field: 'NoOfTransactions' },
        ImagePath: { type: DataTypes.STRING, field: 'ImagePath' },
        DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        HSNId: { type: DataTypes.BIGINT, field: 'HSNId' },
        HSNCode: { type: DataTypes.STRING, field: 'HSNCode' },
        HSNName: { type: DataTypes.STRING, field: 'HSNName' },
        ScheduleTypeId: { type: DataTypes.BIGINT, field: 'ScheduleTypeId' },
        StorageConditionId: { type: DataTypes.BIGINT, field: 'StorageConditionId' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        InGstId: { type: DataTypes.BIGINT, field: 'InGstId' },
        CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
        SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
        IndicationId: { type: DataTypes.BIGINT, field: 'IndicationId' },
        AccountCode: { type: DataTypes.STRING, field: 'AccountCode' },
        SubAccountCode: { type: DataTypes.STRING, field: 'SubAccountCode' },
        ProductRegNo: { type: DataTypes.STRING, field: 'ProductRegNo' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        IsBatchMandatory: { type: DataTypes.BOOLEAN, field: 'IsBatchMandatory' },
        IsExpiryMandatory: { type: DataTypes.BOOLEAN, field: 'IsExpiryMandatory' },
        IsHighAlert: { type: DataTypes.BOOLEAN, field: 'IsHighAlert' },
        CalculateTaxonMRP: { type: DataTypes.BOOLEAN, field: 'CalculateTaxonMRP' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        ItemPrice: { type: DataTypes.DECIMAL, field: 'ItemPrice' },
        CostPrice: { type: DataTypes.DECIMAL, field: 'CostPrice' },
        MrPrice: { type: DataTypes.DECIMAL, field: 'MrPrice' },
        Mrp: { type: DataTypes.DECIMAL, field: 'Mrp' },
        IsConsignment: { type: DataTypes.BOOLEAN, field: 'IsConsignment' },
        IsGenericAllow: { type: DataTypes.BOOLEAN, field: 'IsGenericAllow' },
        IsManufacture: { type: DataTypes.BOOLEAN, field: 'IsManufacture' },
        IsBillable: { type: DataTypes.BOOLEAN, field: 'IsBillable' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        IsCssd: { type: DataTypes.BOOLEAN, field: 'IsCssd' },
        IsConsumable: { type: DataTypes.BOOLEAN, field: 'IsConsumable' },
        IsControlled: { type: DataTypes.BOOLEAN, field: 'IsControlled' },
        IsColdChain: { type: DataTypes.BOOLEAN, field: 'IsColdChain' },
        IsAsset: { type: DataTypes.BOOLEAN, field: 'IsAsset' },
        IsDescriptionEdit: { type: DataTypes.BOOLEAN, field: 'IsDescriptionEdit' },
        IsNarcotic: { type: DataTypes.BOOLEAN, field: 'IsNarcotic' },
        IsEmergency: { type: DataTypes.BOOLEAN, field: 'IsEmergency' },
        IsLASADrug: { type: DataTypes.BOOLEAN, field: 'IsLASADrug' },
        DepartmentId: { type: DataTypes.INTEGER, field: 'DepartmentId' },
        IsReusable: { type: DataTypes.BOOLEAN, field: 'IsReusable' },
        IsDecimalAllowed: { type: DataTypes.BOOLEAN, field: 'IsDecimalAllowed' },
        IsMRPRequired: { type: DataTypes.BOOLEAN, field: 'IsMRPRequired' },
        IsNonClaimable: { type: DataTypes.BOOLEAN, field: 'IsNonClaimable' },
        CanEditPriceForGrn: { type: DataTypes.BOOLEAN, field: 'CanEditPriceForGrn' },
        Min: { type: DataTypes.INTEGER, field: 'Min' },
        Max: { type: DataTypes.INTEGER, field: 'Max' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsMultiUse: { type: DataTypes.BOOLEAN, field: 'IsMultiUse' },
        ABCClassId: { type: DataTypes.BIGINT, field: 'ABCClassId' },
        VEDId: { type: DataTypes.BIGINT, field: 'VEDId' },
        AllowStaffDiscount: { type: DataTypes.BOOLEAN, field: 'AllowStaffDiscount' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        FreeQty: { type: DataTypes.INTEGER, field: 'FreeQty' },
        PurConQty: { type: DataTypes.INTEGER, field: 'PurConQty' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        IsSeniorCitizenDiscount: { type: DataTypes.BOOLEAN, field: 'IsSeniorCitizenDiscount' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'itemmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ItemMaster as any).associate = function (models: Models) {
        ItemMaster.belongsTo(models.UomMaster, { foreignKey: 'BaseUomId' });
        ItemMaster.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        ItemMaster.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        ItemMaster.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
        ItemMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        ItemMaster.belongsTo(models.ReferenceValue, { as: 'DiscountMode', targetKey: 'ReferenceValueCodeId' });
        ItemMaster.belongsTo(models.ReferenceValue, { as: 'ScheduleType', targetKey: 'ReferenceValueCodeId' });
        ItemMaster.belongsTo(models.ItemCategory, { foreignKey: 'CategoryId' });
        ItemMaster.belongsTo(models.ItemSubCategory, { foreignKey: 'SubCategoryId' });
        ItemMaster.belongsTo(models.ItemSubType, { foreignKey: 'SubTypeId' });
        ItemMaster.belongsTo(models.GenericMaster, { foreignKey: 'GenericId' });
        ItemMaster.belongsTo(models.DrugMaster, { foreignKey: 'DrugId' });
        ItemMaster.belongsTo(models.HsnMaster, { foreignKey: 'HSNId' });
        ItemMaster.belongsTo(models.Organization);
        ItemMaster.belongsTo(models.ProductType, { foreignKey: 'ProductTypeId' });
        ItemMaster.belongsTo(models.ProductSubType, { foreignKey: 'SubProductTypeId' });
        ItemMaster.belongsTo(models.VendorMaster, { as: 'Manufacturer', foreignKey: 'ManufacturerId' });
        ItemMaster.belongsTo(models.VendorMaster, { foreignKey: 'ManufacturerId' });
        ItemMaster.belongsToMany(models.StoreMaster, { through: models.ItemStoreMap });
        ItemMaster.belongsToMany(models.VendorMaster, { through: models.ItemVendorMap });
        ItemMaster.hasOne(models.StockItem, { foreignKey: 'ItemMasterId' });
        ItemMaster.hasOne(models.StockItem, { as: 'ToStoreStock', foreignKey: 'ItemMasterId' });
        ItemMaster.hasOne(models.StockItem, { as: 'ReqStoreStock', foreignKey: 'ItemMasterId' });
        ItemMaster.hasMany(models.ItemVendorMap, { foreignKey: 'ItemMasterId' });
        ItemMaster.hasMany(models.StockRequestDetail, { foreignKey: 'ItemMasterId' });
        ItemMaster.hasMany(models.UomConversion, { foreignKey: 'ItemMasterId' });
        ItemMaster.belongsTo(models.GstMaster, { foreignKey: 'GstId' });
        ItemMaster.belongsTo(models.GstMaster, { as: 'InGstMaster', foreignKey: 'InGstId' });
        ItemMaster.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        ItemMaster.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
        ItemMaster.hasMany(models.PurchaseOrderDetail, { foreignKey: 'ItemMasterId' });
        ItemMaster.hasMany(models.GuarantorSupplementary, { as: 'Supplementary' });
        ItemMaster.belongsTo(models.Indication, { foreignKey: 'IndicationId' });
        ItemMaster.hasMany(models.ItemFacilityMap);
        ItemMaster.belongsTo(models.ItemStoreMap, { as: 'StoreMap', foreignKey: 'ItemMasterId' });
    };
    return ItemMaster;
}
