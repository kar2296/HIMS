import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StoreMasterDetailInstance, i.StoreMasterDetailAttributes> {
    let StoreMasterDetail = sequelize.define<i.StoreMasterDetailInstance, i.StoreMasterDetailAttributes>('StoreMasterDetail', {
        Id: { type: DataTypes.BIGINT, field: 'StoreMasterDetailId', primaryKey: true, autoIncrement: true },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreCode: { type: DataTypes.STRING, field: 'StoreCode' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        StoreDescription: { type: DataTypes.STRING, field: 'StoreDescription' },
        StoreTypeId: { type: DataTypes.BIGINT, field: 'StoreTypeId' },
        // StoreSubTypeId: { type: DataTypes.BIGINT, field: 'StoreSubTypeId' },
        // StorePolicyId: { type: DataTypes.BIGINT, field: 'StorePolicyId' },
        // DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        // LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        LicenseNo: { type: DataTypes.STRING, field: 'LicenseNo' },
        // LicenseNo1: { type: DataTypes.STRING, field: 'LicenseNo1' },
        TinNo: { type: DataTypes.STRING, field: 'TinNo' },
        Email: { type: DataTypes.STRING, field: 'Email' },
        // Password: { type: DataTypes.STRING, field: 'Password' },
        // ExpiryWarningDays: { type: DataTypes.INTEGER, field: 'ExpiryWarningDays' },
        // ExpiryPriorStopDays: { type: DataTypes.INTEGER, field: 'ExpiryPriorStopDays' },
        // LeadTimeForPO: { type: DataTypes.STRING, field: 'LeadTimeForPO' },
        // AccountCode: { type: DataTypes.STRING, field: 'AccountCode' },
        // SubAccountCode: { type: DataTypes.STRING, field: 'SubAccountCode' },
        // Privillages: { type: DataTypes.STRING, field: 'Privillages' },
        // BlockMaterialRequest: { type: DataTypes.BOOLEAN, field: 'BlockMaterialRequest' },
        // PurchaseReturnToRespectiveVendor: { type: DataTypes.BOOLEAN, field: 'PurchaseReturnToRespectiveVendor' },
        // IsPrimaryStore: { type: DataTypes.BOOLEAN, field: 'IsPrimaryStore' },
        // PrinterOptionId: { type: DataTypes.INTEGER, field: 'PrinterOptionId' },
        // SequenceOptionId: { type: DataTypes.INTEGER, field: 'SequenceOptionId' },
        // IsRequestMandatory: { type: DataTypes.BOOLEAN, field: 'IsRequestMandatory' },
        // IsManualBatchSelection: { type: DataTypes.BOOLEAN, field: 'IsManualBatchSelection' },
        // IsPOMandatory: { type: DataTypes.BOOLEAN, field: 'IsPOMandatory' },
        // CanAllowIPDiscount: { type: DataTypes.BOOLEAN, field: 'CanAllowIPDiscount' },
        // CanAllowOpenPO: { type: DataTypes.BOOLEAN, field: 'CanAllowOpenPO' },
        // CanAllowOpenGRN: { type: DataTypes.BOOLEAN, field: 'CanAllowOpenGRN' },
        // GRNApprovalRequired: { type: DataTypes.BOOLEAN, field: 'GRNApprovalRequired' },
        // StockRequestApprovalRequired: { type: DataTypes.BOOLEAN, field: 'StockRequestApprovalRequired' },
        // IsDefaultPrescriptionStore: { type: DataTypes.BOOLEAN, field: 'IsDefaultPrescriptionStore' },
        // IsDefaultWardindentStore: { type: DataTypes.BOOLEAN, field: 'IsDefaultWardindentStore' },
        // CanSeeToStoreQty: { type: DataTypes.BOOLEAN, field: 'CanSeeToStoreQty' },
        // IsGstEditablePo: { type: DataTypes.BOOLEAN, field: 'IsGstEditablePo' },
        // IsOpticalStore: { type: DataTypes.BOOLEAN, field: 'IsOpticalStore' },
        // OpenAutoReOrder: { type: DataTypes.BOOLEAN, field: 'OpenAutoReOrder' },
        // AllowOpenRequest: { type: DataTypes.BOOLEAN, field: 'AllowOpenRequest' },
        // ISSeparatePayCounter: { type: DataTypes.BOOLEAN, field: 'ISSeparatePayCounter' },
        // LogoPath: { type: DataTypes.STRING, field: 'LogoPath' },
        // ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        // IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        // IsIndentStore: { type: DataTypes.BOOLEAN, field: 'IsIndentStore' },
        // IsSeqbasedStore: { type: DataTypes.BOOLEAN, field: 'IsSeqbasedStore' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        // AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        // AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        WholeSaleLicenseNumber1: { type: DataTypes.BIGINT, field: 'WholeSaleLicenseNumber1' },
        WholeSaleLicenseNumber2: { type: DataTypes.BIGINT, field: 'WholeSaleLicenseNumber2' },
        // ScheduleXDLNo: { type: DataTypes.BIGINT, field: 'ScheduleXDLNo' },
        // CSTNumber: { type: DataTypes.BIGINT, field: 'CSTNumber' },
        // IsWhatsapp: { type: DataTypes.BOOLEAN, field: 'IsWhatsapp' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'storemasterdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StoreMasterDetail as any).associate = function (models: Models) {
        StoreMasterDetail.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        StoreMasterDetail.belongsTo(models.ReferenceValue, { as: 'StoreType', targetKey: 'ReferenceValueCodeId' });
        // StoreMasterDetail.belongsTo(models.ReferenceValue, { as: 'StoreSubType', targetKey: 'ReferenceValueCodeId' });
        // StoreMasterDetail.belongsTo(models.ReferenceValue, { as: 'StorePolicy', targetKey: 'ReferenceValueCodeId' });
        // StoreMasterDetail.belongsTo(models.ReferenceValue, { as: 'PrinterOption', targetKey: 'ReferenceValueCodeId' });
        // StoreMasterDetail.belongsTo(models.Facility);
        // StoreMasterDetail.belongsTo(models.Department);
        // StoreMasterDetail.belongsToMany(models.ItemMaster, { through: models.ItemStoreMap });
    };
    return StoreMasterDetail;
}
