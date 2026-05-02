import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDispenseDetailsInstance, i.PatientDispenseDetailsAttributes> {
    let PatientDispenseDetails = sequelize.define<i.PatientDispenseDetailsInstance,
        i.PatientDispenseDetailsAttributes>('PatientDispenseDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientDispenseDetailId', primaryKey: true, autoIncrement: true },
            PatientStockRequestDetailId: { type: DataTypes.BIGINT, field: 'PatientStockRequestDetailId' },
            PatientDispenseId: { type: DataTypes.BIGINT, field: 'PatientDispenseId' },
            DispenseDateTime: { type: DataTypes.DATE, field: 'DispenseDateTime' },
            ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
            ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
            ReqItemMasterId: { type: DataTypes.BIGINT, field: 'ReqItemMasterId' },
            ReqItemCode: { type: DataTypes.STRING, field: 'ReqItemCode' },
            ReqItemName: { type: DataTypes.STRING, field: 'ReqItemName' },
            IsAlternateIssued: { type: DataTypes.BOOLEAN, field: 'IsAlternateIssued' },
            CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
            SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
            ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
            SubProductTypeId: { type: DataTypes.BIGINT, field: 'SubProductTypeId' },
            GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
            GenericName: { type: DataTypes.STRING, field: 'GenericName' },
            ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
            ManufacturerName: { type: DataTypes.STRING, field: 'ManufacturerName' },
            ScheduleTypeId: { type: DataTypes.BIGINT, field: 'ScheduleTypeId' },
            ScheduleTypeDescription: { type: DataTypes.STRING, field: 'ScheduleTypeDescription' },
            BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
            PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
            SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
            RequestedQuantity: { type: DataTypes.INTEGER, field: 'RequestedQuantity' },
            QuantityBeforeDispense: { type: DataTypes.INTEGER, field: 'QuantityBeforeDispense' },
            DispensedQuantity: { type: DataTypes.INTEGER, field: 'DispensedQuantity' },
            StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
            StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            BatchId: { type: DataTypes.STRING, field: 'BatchId' },
            ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
            Ucp: { type: DataTypes.DECIMAL, field: 'Ucp' },
            Mrp: { type: DataTypes.DECIMAL, field: 'Mrp' },
            Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
            GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
            GrossGstAmount: { type: DataTypes.DECIMAL, field: 'GrossGstAmount' },
            DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
            DiscountValue: { type: DataTypes.DECIMAL, field: 'DiscountValue' },
            DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
            DoctorDiscountAmount: { type: DataTypes.DECIMAL, field: 'DoctorDiscountAmount' },
            GstId: { type: DataTypes.BIGINT, field: 'GstId' },
            GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
            UnitGstAmount: { type: DataTypes.DECIMAL, field: 'UnitGstAmount' },
            GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
            InGstId: { type: DataTypes.BIGINT, field: 'InGstId' },
            InGstPercentage: { type: DataTypes.DECIMAL, field: 'InGstPercentage' },
            UnitInGstAmount: { type: DataTypes.DECIMAL, field: 'UnitInGstAmount' },
            InGstAmount: { type: DataTypes.DECIMAL, field: 'InGstAmount' },
            CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
            CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
            UnitCGstAmount: { type: DataTypes.DECIMAL, field: 'UnitCGstAmount' },
            CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
            SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
            SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
            UnitSGstAmount: { type: DataTypes.DECIMAL, field: 'UnitSGstAmount' },
            SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
            NetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGst' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            IsGstDoctor: { type: DataTypes.BOOLEAN, field: 'IsGstDoctor' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            InsNetAmount: { type: DataTypes.DECIMAL, field: 'InsNetAmount' },
            PatNetAmount: { type: DataTypes.DECIMAL, field: 'PatNetAmount' },
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
                tableName: 'patientdispensedetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientDispenseDetails as any).associate = function (models: Models) {
        PatientDispenseDetails.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        PatientDispenseDetails.belongsTo(models.StockItem, { foreignKey: 'StockItemId' });
        PatientDispenseDetails.belongsTo(models.StockSerialItem, { foreignKey: 'StockSerialItemId' });
        PatientDispenseDetails.belongsTo(models.PatientStockRequestDetails, { foreignKey: 'PatientStockRequestDetailId' });
        PatientDispenseDetails.belongsTo(models.PatientDispense, { foreignKey: 'PatientDispenseId' });
    };

    return PatientDispenseDetails;
}


