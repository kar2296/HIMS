import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CustomerBillDetailsInstance, i.CustomerBillDetailsAttributes> {
    let CustomerBillDetails = sequelize.define<i.CustomerBillDetailsInstance, i.CustomerBillDetailsAttributes>('CustomerBillDetails', {
        Id: { type: DataTypes.BIGINT, field: 'CustomerBillDetailId', primaryKey: true, autoIncrement: true },
        CustomerBillId: { type: DataTypes.BIGINT, field: 'CustomerBillId' },
        BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
        CustomerBillStatusId: { type: DataTypes.BIGINT, field: 'CustomerBillStatusId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        SubProductTypeId: { type: DataTypes.BIGINT, field: 'SubProductTypeId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        ConversionQuantity: { type: DataTypes.DECIMAL, field: 'ConversionQuantity' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        ConversionQty: { type: DataTypes.DECIMAL, field: 'ConversionQty' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        GenericName: { type: DataTypes.STRING, field: 'GenericName' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        ManufacturerName: { type: DataTypes.STRING, field: 'ManufacturerName' },
        ScheduleTypeId: { type: DataTypes.BIGINT, field: 'ScheduleTypeId' },
        ScheduleTypeDescription: { type: DataTypes.STRING, field: 'ScheduleTypeDescription' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
        StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        QuantityAfterConversion: { type: DataTypes.INTEGER, field: 'QuantityAfterConversion' },
        FreeQty: { type: DataTypes.INTEGER, field: 'FreeQty' },
        FreeQtyAfterConversion: { type: DataTypes.INTEGER, field: 'FreeQtyAfterConversion' },
        ReturnedQuantity: { type: DataTypes.INTEGER, field: 'ReturnedQuantity' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
        UnitRate: { type: DataTypes.DECIMAL, field: 'UnitRate' },
        Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
        UnitAmount: { type: DataTypes.DECIMAL, field: 'UnitAmount' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountValue: { type: DataTypes.DECIMAL, field: 'DiscountValue' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        UnitDiscountAmount: { type: DataTypes.DECIMAL, field: 'UnitDiscountAmount' },
        RateAfterDiscount: { type: DataTypes.DECIMAL, field: 'RateAfterDiscount' },
        UnitRateAfterDiscount: { type: DataTypes.DECIMAL, field: 'UnitRateAfterDiscount' },
        AmountAfterDiscount: { type: DataTypes.DECIMAL, field: 'AmountAfterDiscount' },
        UnitAmountAfterDiscount: { type: DataTypes.DECIMAL, field: 'UnitAmountAfterDiscount' },
        NetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGst' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
        UnitGstAmount: { type: DataTypes.DECIMAL, field: 'UnitGstAmount' },
        CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
        CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
        CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
        UnitCGstAmount: { type: DataTypes.DECIMAL, field: 'UnitCGstAmount' },
        SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
        SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
        SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
        UnitSGstAmount: { type: DataTypes.DECIMAL, field: 'UnitSGstAmount' },
        RateAfterGst: { type: DataTypes.DECIMAL, field: 'RateAfterGst' },
        UnitRateAfterGst: { type: DataTypes.DECIMAL, field: 'UnitRateAfterGst' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        ProfitAmount: { type: DataTypes.DECIMAL, field: 'ProfitAmount' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'customerbilldetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (CustomerBillDetails as any).associate = function (models: Models) {
        CustomerBillDetails.belongsTo(models.Department);
        CustomerBillDetails.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        CustomerBillDetails.belongsTo(models.StockSerialItem, { foreignKey: 'StockSerialItemId' });
        CustomerBillDetails.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        CustomerBillDetails.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        CustomerBillDetails.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
        CustomerBillDetails.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        CustomerBillDetails.belongsTo(models.CustomerBills, { foreignKey: 'CustomerBillId' });
        CustomerBillDetails.belongsTo(models.ReferenceValue, { as: 'CustomerBillStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return CustomerBillDetails;
}
