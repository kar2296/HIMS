import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemCustomerMapInstance, i.ItemCustomerMapAttributes> {
    let ItemCustomerMap = sequelize.define<i.ItemCustomerMapInstance, i.ItemCustomerMapAttributes>('ItemCustomerMap', {
        Id: { type: DataTypes.BIGINT, field: 'ItemCustomerMapId', primaryKey: true, autoIncrement: true },
        ItemFacilityMapId: { type: DataTypes.BIGINT, field: 'ItemFacilityMapId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CustomerMasterId: { type: DataTypes.BIGINT, field: 'CustomerMasterId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        FacilityCode: { type: DataTypes.STRING, field: 'FacilityCode' },
        CustomerCode: { type: DataTypes.STRING, field: 'CustomerCode' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        FacilityName: { type: DataTypes.STRING, field: 'FacilityName' },
        CustomerName: { type: DataTypes.STRING, field: 'CustomerName' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        SubProductTypeId: { type: DataTypes.BIGINT, field: 'SubProductTypeId' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        PurchaseUomCode: { type: DataTypes.STRING, field: 'PurchaseUomCode' },
        ConversionQuantity: { type: DataTypes.INTEGER, field: 'ConversionQuantity' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        SaleUomCode: { type: DataTypes.STRING, field: 'SaleUomCode' },
        MinQty: { type: DataTypes.INTEGER, field: 'MinQty' },
        MaxQty: { type: DataTypes.INTEGER, field: 'MaxQty' },
        FreeQty: { type: DataTypes.INTEGER, field: 'FreeQty' },
        UomPrice: { type: DataTypes.DECIMAL, field: 'UomPrice' },
        UomCrPrice: { type: DataTypes.DECIMAL, field: 'UomCrPrice' },
        UomMrPrice: { type: DataTypes.DECIMAL, field: 'UomMrPrice' },
        Price: { type: DataTypes.DECIMAL, field: 'Price' },
        CrPrice: { type: DataTypes.DECIMAL, field: 'CrPrice' },
        MrPrice: { type: DataTypes.DECIMAL, field: 'MrPrice' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountModeCode: { type: DataTypes.STRING, field: 'DiscountModeCode' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        GstCode: { type: DataTypes.STRING, field: 'GstCode' },
        GstName: { type: DataTypes.STRING, field: 'GstName' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
        CGstCode: { type: DataTypes.STRING, field: 'CGstCode' },
        CGstName: { type: DataTypes.STRING, field: 'CGstName' },
        CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
        SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
        SGstCode: { type: DataTypes.STRING, field: 'SGstCode' },
        SGstName: { type: DataTypes.STRING, field: 'SGstName' },
        SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'Createdby' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'Updatedby' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'itemcustomermap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ItemCustomerMap as any).associate = function (models: Models) {
        ItemCustomerMap.belongsTo(models.CustomerMaster, { foreignKey: 'CustomerMasterId' });
        ItemCustomerMap.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        ItemCustomerMap.belongsTo(models.ItemCategory, { foreignKey: 'CategoryId' });
        ItemCustomerMap.belongsTo(models.ProductType, { foreignKey: 'ProductTypeId' });
        ItemCustomerMap.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        ItemCustomerMap.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
        ItemCustomerMap.belongsTo(models.ReferenceValue, { as: 'DiscountMode', targetKey: 'ReferenceValueCodeId' });
        ItemCustomerMap.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        ItemCustomerMap.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        ItemCustomerMap.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
        ItemCustomerMap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return ItemCustomerMap;
}
