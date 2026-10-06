import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemFacilityMapInstance, i.ItemFacilityMapAttributes> {
    let ItemFacilityMap = sequelize.define<i.ItemFacilityMapInstance, i.ItemFacilityMapAttributes>('ItemFacilityMap', {
        Id: { type: DataTypes.BIGINT, field: 'ItemFacilityMapId', primaryKey: true, autoIncrement: true },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        ItemDescription: { type: DataTypes.STRING, field: 'ItemDescription' },
        ItemShortDescription: { type: DataTypes.STRING, field: 'ItemShortDescription' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        SubProductTypeId: { type: DataTypes.BIGINT, field: 'SubProductTypeId' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        GenericCode: { type: DataTypes.STRING, field: 'GenericCode' },
        GenericName: { type: DataTypes.STRING, field: 'GenericName' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        ManufacturerCode: { type: DataTypes.STRING, field: 'ManufacturerCode' },
        ManufacturerName: { type: DataTypes.STRING, field: 'ManufacturerName' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
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
        IsConsignment: { type: DataTypes.BOOLEAN, field: 'IsConsignment' },
        IsGenericAllow: { type: DataTypes.BOOLEAN, field: 'IsGenericAllow' },
        IsManufacture: { type: DataTypes.BOOLEAN, field: 'IsManufacture' },
        IsBillable: { type: DataTypes.BOOLEAN, field: 'IsBillable' },
        IsCssd: { type: DataTypes.BOOLEAN, field: 'IsCssd' },
        IsConsumable: { type: DataTypes.BOOLEAN, field: 'IsConsumable' },
        IsControlled: { type: DataTypes.BOOLEAN, field: 'IsControlled' },
        IsColdChain: { type: DataTypes.BOOLEAN, field: 'IsColdChain' },
        IsAsset: { type: DataTypes.BOOLEAN, field: 'IsAsset' },
        IsDescriptionEdit: { type: DataTypes.BOOLEAN, field: 'IsDescriptionEdit' },
        IsNarcotic: { type: DataTypes.BOOLEAN, field: 'IsNarcotic' },
        IsReusable: { type: DataTypes.BOOLEAN, field: 'IsReusable' },
        IsMRPRequired: { type: DataTypes.BOOLEAN, field: 'IsMRPRequired' },
        IsNonClaimable: { type: DataTypes.BOOLEAN, field: 'IsNonClaimable' },
        CanEditPriceForGrn: { type: DataTypes.BOOLEAN, field: 'CanEditPriceForGrn' },
        Min: { type: DataTypes.INTEGER, field: 'Min' },
        Max: { type: DataTypes.INTEGER, field: 'Max' },
        IndicationId: { type: DataTypes.BIGINT, field: 'IndicationId' },
        ABCClassId: { type: DataTypes.BIGINT, field: 'ABCClassId' },
        VEDId: { type: DataTypes.BIGINT, field: 'VEDId' },
        AllowStaffDiscount: { type: DataTypes.BOOLEAN, field: 'AllowStaffDiscount' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'itemfacilitymap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ItemFacilityMap as any).associate = function (models: Models) {
        ItemFacilityMap.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        ItemFacilityMap.belongsTo(models.UomMaster, { foreignKey: 'BaseUomId' });
        ItemFacilityMap.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        ItemFacilityMap.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        ItemFacilityMap.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
        ItemFacilityMap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        ItemFacilityMap.belongsTo(models.ReferenceValue, { as: 'ScheduleType', targetKey: 'ReferenceValueCodeId' });
        ItemFacilityMap.belongsTo(models.ItemCategory, { foreignKey: 'CategoryId' });
        ItemFacilityMap.belongsTo(models.ItemSubCategory, { foreignKey: 'SubCategoryId' });
        ItemFacilityMap.belongsTo(models.GenericMaster, { foreignKey: 'GenericId' });
        ItemFacilityMap.belongsTo(models.DrugMaster, { foreignKey: 'DrugId' });
        //ItemFacilityMap.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        ItemFacilityMap.belongsTo(models.ProductType, { foreignKey: 'ProductTypeId' });
        ItemFacilityMap.belongsTo(models.ProductSubType, { foreignKey: 'SubProductTypeId' });
        ItemFacilityMap.belongsTo(models.VendorMaster, { as: 'Manufacturer', foreignKey: 'ManufacturerId' });
        ItemFacilityMap.belongsTo(models.VendorMaster, { foreignKey: 'ManufacturerId' });
        //ItemFacilityMap.belongsToMany(models.StoreMaster, { through: models.ItemStoreMap });
        //ItemFacilityMap.belongsToMany(models.VendorMaster, { through: models.ItemVendorMap });
        //ItemFacilityMap.hasOne(models.StockItem, { foreignKey: 'ItemMasterId' });
        //ItemFacilityMap.hasOne(models.StockItem, { as: 'ToStoreStock', foreignKey: 'ItemMasterId' });
        //ItemFacilityMap.hasMany(models.ItemVendorMap, { foreignKey: 'ItemMasterId' });
        //ItemFacilityMap.hasMany(models.StockRequestDetail, { foreignKey: 'ItemMasterId' });
        //ItemFacilityMap.belongsToMany(models.ItemMaster, { through: models.UomConversion, as: 'UomConversions' });
        //ItemFacilityMap.belongsTo(models.GstMaster, { foreignKey: 'GstId' });
        //ItemFacilityMap.belongsTo(models.GstMaster, { as: 'InGstMaster', foreignKey: 'InGstId' });
        //ItemFacilityMap.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        //ItemFacilityMap.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
        //ItemFacilityMap.hasMany(models.PurchaseOrderDetail, { foreignKey: 'ItemMasterId' });
    };
    return ItemFacilityMap;
}
