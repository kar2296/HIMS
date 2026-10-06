import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientReturnDetailsInstance, i.PatientReturnDetailsAttributes> {
    let PatientReturnDetails = sequelize.define<i.PatientReturnDetailsInstance, i.PatientReturnDetailsAttributes>('PatientReturnDetails', {
        Id: { type: DataTypes.BIGINT, field: 'PatientReturnDetailId', primaryKey: true, autoIncrement: true },
        PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        PatientReturnId: { type: DataTypes.BIGINT, field: 'PatientReturnId' },
        ReturnDateTime: { type: DataTypes.DATE, field: 'ReturnDateTime' },
        ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
        ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        ServiceTypeId: { type: DataTypes.BIGINT, field: 'ServiceTypeId' },
        ServiceGroupId: { type: DataTypes.BIGINT, field: 'ServiceGroupId' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        SoldQuantity: { type: DataTypes.INTEGER, field: 'SoldQuantity' },
        ReturnedQuantity: { type: DataTypes.INTEGER, field: 'ReturnedQuantity' },
        MasterItemId: { type: DataTypes.BIGINT, field: 'MasterItemId' },
        MasterTypeId: { type: DataTypes.BIGINT, field: 'MasterTypeId' },
        MasterName: { type: DataTypes.STRING, field: 'MasterName' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        GenericName: { type: DataTypes.STRING, field: 'GenericName' },
        RackId: { type: DataTypes.BIGINT, field: 'RackId' },
        RackName: { type: DataTypes.STRING, field: 'RackName' },
        Shelf: { type: DataTypes.STRING, field: 'Shelf' },
        Tray: { type: DataTypes.STRING, field: 'Tray' },
        IsPrescribed: { type: DataTypes.BOOLEAN, field: 'IsPrescribed' },
        ScheduleTypeId: { type: DataTypes.BIGINT, field: 'ScheduleTypeId' },
        ScheduleTypeDescription: { type: DataTypes.STRING, field: 'ScheduleTypeDescription' },
        BilledQuantity: { type: DataTypes.INTEGER, field: 'BilledQuantity' },
        ReturnQuantity: { type: DataTypes.INTEGER, field: 'ReturnQuantity' },
        StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
        StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
        Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        GrossGSTAmount: { type: DataTypes.DECIMAL, field: 'GrossGSTAmount' },
        DiscountModeId: { type: DataTypes.INTEGER, field: 'DiscountModeId' },
        DiscountPercentage: { type: DataTypes.DECIMAL, field: 'DiscountPercentage' },
        UnitDiscountAmount: { type: DataTypes.DECIMAL, field: 'UnitDiscountAmount' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        DoctorDiscountAmount: { type: DataTypes.DECIMAL, field: 'DoctorDiscountAmount' },
        EducationCess: { type: DataTypes.DECIMAL, field: 'EducationCess' },
        GSTAmount: { type: DataTypes.DECIMAL, field: 'GSTAmount' },
        UnitGSTAmount: { type: DataTypes.DECIMAL, field: 'UnitGSTAmount' },
        NetAmountBeforeGST: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGST' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        FreeNetAmount: { type: DataTypes.DECIMAL, field: 'FreeNetAmount' },
        GSTId: { type: DataTypes.DECIMAL, field: 'GSTId' },
        GSTPercentage: { type: DataTypes.DECIMAL, field: 'GSTPercentage' },
        GSTCode: { type: DataTypes.STRING, field: 'GSTCode' },
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
            tableName: 'patientreturndetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientReturnDetails as any).associate = function (models: Models) {
        PatientReturnDetails.belongsTo(models.Department);
        PatientReturnDetails.belongsTo(models.ServiceItem, { foreignKey: 'ServiceId' });
        PatientReturnDetails.belongsTo(models.PatientReturns, { foreignKey: 'PatientReturnId' });
        PatientReturnDetails.belongsTo(models.ServiceCategory, { foreignKey: 'ServiceCategoryId' });
        PatientReturnDetails.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientReturnDetails.belongsTo(models.User, { foreignKey: 'DoctorId' });
        PatientReturnDetails.belongsTo(models.GstMaster, { foreignKey: 'GSTId' });
        PatientReturnDetails.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        PatientReturnDetails.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
    };
    return PatientReturnDetails;
}
