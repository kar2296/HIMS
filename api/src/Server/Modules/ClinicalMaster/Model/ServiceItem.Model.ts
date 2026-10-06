import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceItemInstance, i.ServiceItemAttributes> {
    let ServiceItem = sequelize.define<i.ServiceItemInstance, i.ServiceItemAttributes>('ServiceItem', {
        Id: { type: DataTypes.BIGINT, field: 'ServiceItemId', primaryKey: true, autoIncrement: true },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ShortCode: { type: DataTypes.STRING, field: 'ShortCode' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        MasterTypeId: { type: DataTypes.BIGINT, field: 'MasterTypeId' },
        MasterItemId: { type: DataTypes.BIGINT, field: 'MasterItemId' },
        MasterName: { type: DataTypes.STRING, field: 'MasterName' },
        ItemCost: { type: DataTypes.STRING, field: 'ItemCost' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        BillingGroupId: { type: DataTypes.BIGINT, field: 'BillingGroupId' },
        AccountCodeCredit: { type: DataTypes.STRING, field: 'AccountCodeCredit' },
        AccountCodeDebit: { type: DataTypes.STRING, field: 'AccountCodeDebit' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        IsOrderable: { type: DataTypes.BOOLEAN, field: 'IsOrderable' },
        IsRateEditable: { type: DataTypes.BOOLEAN, field: 'IsRateEditable' },
        IsDiscountEditable: { type: DataTypes.BOOLEAN, field: 'IsDiscountEditable' },
        Outsourced: { type: DataTypes.BOOLEAN, field: 'Outsourced' },
        IsZeroBill: { type: DataTypes.BOOLEAN, field: 'IsZeroBill' },
        IsDoctorMandatory: { type: DataTypes.BOOLEAN, field: 'IsDoctorMandatory' },
        IsSurgicalProcedure: { type: DataTypes.BOOLEAN, field: 'IsSurgicalProcedure' },
        IsEquipment: { type: DataTypes.BOOLEAN, field: 'IsEquipment' },
        IsEquipmentHour: { type: DataTypes.BOOLEAN, field: 'IsEquipmentHour' },
        IsEquipmentDaily: { type: DataTypes.BOOLEAN, field: 'IsEquipmentDaily' },
        IsBedCharge: { type: DataTypes.BOOLEAN, field: 'IsBedCharge' },
        IsBedChargeHour: { type: DataTypes.BOOLEAN, field: 'IsBedChargeHour' },
        IsBedChargeDaily: { type: DataTypes.BOOLEAN, field: 'IsBedChargeDaily' },
        IsCalculateGST: { type: DataTypes.BOOLEAN, field: 'IsCalculateGST' },
        IsPackage: { type: DataTypes.BOOLEAN, field: 'IsPackage' },
        IsSaveServiceDetails: { type: DataTypes.BOOLEAN, field: 'IsSaveServiceDetails' },
        OrderTypeId: { type: DataTypes.INTEGER, field: 'OrderTypeId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsDoctorDisplay: { type: DataTypes.BOOLEAN, field: 'IsDoctorDisplay' },
        IsNightCharge: { type: DataTypes.BOOLEAN, field: 'IsNightCharge' },
        IsHolidayCharge: { type: DataTypes.BOOLEAN, field: 'IsHolidayCharge' },
        IsDuplicateAlert: { type: DataTypes.BOOLEAN, field: 'IsDuplicateAlert' },
        IsInstrument: { type: DataTypes.BOOLEAN, field: 'IsInstrument' },
        CanDiscountProportionate: { type: DataTypes.BOOLEAN, field: 'CanDiscountProportionate' },
        IsExecutableProcedure: { type: DataTypes.BOOLEAN, field: 'IsExecutableProcedure' },
        IsCalculateTax: { type: DataTypes.BOOLEAN, field: 'IsCalculateTax' },
        IsPhysiotheraphy: { type: DataTypes.BOOLEAN, field: 'IsPhysiotheraphy' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        IsExecutingService: { type: DataTypes.BOOLEAN, field: 'IsExecutingService' },
        IsVirtualService: { type: DataTypes.BOOLEAN, field: 'IsVirtualService' },
        IsExternalLab: { type: DataTypes.BOOLEAN, field: 'IsExternalLab' },
        IsNonMedical: { type: DataTypes.BOOLEAN, field: 'IsNonMedical' },
        IsExecDoctor: { type: DataTypes.BOOLEAN, field: 'IsExecDoctor' },
        IsDocShare: { type: DataTypes.BOOLEAN, field: 'IsDocShare' },
        IsOTHourlyCharge: { type: DataTypes.BOOLEAN, field: 'IsOTHourlyCharge' },
        VirtualCategoryId: { type: DataTypes.BIGINT, field: 'VirtualCategoryId' },
        VirtualsubCategoryId: { type: DataTypes.BIGINT, field: 'VirtualsubCategoryId' },
        ServiceDetails: { type: DataTypes.STRING, field: 'ServiceDetails' },
        Imagepath: { type: DataTypes.STRING, field: 'Imagepath' },
        CostCenterId: { type: DataTypes.INTEGER, field: 'CostCenterId' },
        MISSubgroupId: { type: DataTypes.BIGINT, field: 'MISSubgroupId' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'serviceitems',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ServiceItem as any).associate = function (models: Models) {
        ServiceItem.belongsTo(models.ServiceCategory, { as: 'ParentCategory', foreignKey: 'CategoryId' });
        ServiceItem.belongsTo(models.ServiceCategory, { as: 'SubCategory', foreignKey: 'SubCategoryId' });
        ServiceItem.belongsTo(models.ServiceCategory, { foreignKey: 'CategoryId' });
        ServiceItem.hasMany(models.ServiceItemTariffDetail);
        ServiceItem.belongsTo(models.ServiceItemTariffDetail, { as: 'TariffDetail', foreignKey: 'ServiceItemId' });
        ServiceItem.hasMany(models.ServiceItemAlias);
        ServiceItem.hasMany(models.ServiceItemPerformingDoctor);
        ServiceItem.belongsTo(models.GstMaster, { foreignKey: 'GstId' });
        ServiceItem.belongsTo(models.ServiceGroup, { foreignKey: 'BillingGroupId' });
        ServiceItem.belongsTo(models.Department, { as: 'Department', foreignKey: 'DepartmentId' });
        ServiceItem.belongsTo(models.Department, { as: 'SubDepartment', foreignKey: 'SubDepartmentId' });
        ServiceItem.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        ServiceItem.hasMany(models.GuarantorSupplementary, { as: 'Supplementary' });
        ServiceItem.hasMany(models.ServiceItemPackageMap);
        ServiceItem.belongsToMany(models.Facility, { through: models.ServiceItemFacilityMap });
        ServiceItem.belongsTo(models.VirtualCategory, { foreignKey: 'VirtualCategoryId' });
        ServiceItem.belongsTo(models.VirtualSubCategory, { foreignKey: 'VirtualsubCategoryId' });
    };
    return ServiceItem;
}
