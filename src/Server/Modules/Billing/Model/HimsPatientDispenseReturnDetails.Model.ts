import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDispenseReturnDetailsInstance, i.PatientDispenseReturnDetailsAttributes> {
    let PatientDispenseReturnDetails = sequelize.define<i.PatientDispenseReturnDetailsInstance,
        i.PatientDispenseReturnDetailsAttributes>('PatientDispenseReturnDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientDispenseReturnDetailId', primaryKey: true, autoIncrement: true },
            PatientStockReturnDetailId: { type: DataTypes.BIGINT, field: 'PatientStockReturnDetailId' },
            PatientDispenseReturnId: { type: DataTypes.BIGINT, field: 'PatientDispenseReturnId' },
            DispenseReturnDateTime: { type: DataTypes.DATE, field: 'DispenseReturnDateTime' },
            ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
            ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
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
            SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
            ReturnedQuantity: { type: DataTypes.INTEGER, field: 'ReturnedQuantity' },
            QuantityBeforeReceive: { type: DataTypes.INTEGER, field: 'QuantityBeforeReceive' },
            AcceptedQuantity: { type: DataTypes.INTEGER, field: 'AcceptedQuantity' },
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
            GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
            InGstId: { type: DataTypes.BIGINT, field: 'InGstId' },
            InGstPercentage: { type: DataTypes.DECIMAL, field: 'InGstPercentage' },
            InGstAmount: { type: DataTypes.DECIMAL, field: 'InGstAmount' },
            CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
            CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
            CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
            SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
            SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
            SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
            NetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGst' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            InsNetAmount: { type: DataTypes.DECIMAL, field: 'InsNetAmount' },
            PatNetAmount: { type: DataTypes.DECIMAL, field: 'PatNetAmount' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            IsGstDoctor: { type: DataTypes.BOOLEAN, field: 'IsGstDoctor' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
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
                tableName: 'patientdispensereturndetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientDispenseReturnDetails as any).associate = function (models: Models) {
        PatientDispenseReturnDetails.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        PatientDispenseReturnDetails.belongsTo(models.StockItem, { foreignKey: 'StockItemId' });
        PatientDispenseReturnDetails.belongsTo(models.StockSerialItem, { foreignKey: 'StockSerialItemId' });
        PatientDispenseReturnDetails.belongsTo(models.PatientStockReturnDetails, { foreignKey: 'PatientStockReturnDetailId' });
    };

    return PatientDispenseReturnDetails;
}


