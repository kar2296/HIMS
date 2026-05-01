import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EquipmentListInstance, i.EquipmentListAttributes> {
    let EquipmentList = sequelize.define<i.EquipmentListInstance, i.EquipmentListAttributes>('EquipmentList', {
        Id: { type: DataTypes.BIGINT, field: 'AssetId', primaryKey: true, autoIncrement: true },
        AssetCode: { type: DataTypes.STRING, field: 'AssetCode' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        AssetCategoryId: { type: DataTypes.BIGINT, field: 'AssetCategoryId' },
        AssetTypeId: { type: DataTypes.BIGINT, field: 'AssetTypeId' },
        ShortCode: { type: DataTypes.STRING, field: 'ShortCode' },
        ModelNum: { type: DataTypes.STRING, field: 'ModelNum' },
        ModelName: { type: DataTypes.STRING, field: 'ModelName' },
        Serial: { type: DataTypes.STRING, field: 'Serial' },
        Barcode: { type: DataTypes.STRING, field: 'Barcode' },
        Image: { type: DataTypes.STRING, field: 'Image' },
        PhotoPath: { type: DataTypes.STRING, field: 'PhotoPath' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        VendorId: { type: DataTypes.BIGINT, field: 'VendorId' },
        PONum: { type: DataTypes.STRING, field: 'PONum' },
        GRNNum: { type: DataTypes.STRING, field: 'GRNNum' },
        PO: { type: DataTypes.DATE, field: 'PO' },
        GRN: { type: DataTypes.DATE, field: 'GRN' },
        DateOfSold: { type: DataTypes.DATE, field: 'DateOfSold' },
        Contact: { type: DataTypes.STRING, field: 'Contact' },
        ContactPerson: { type: DataTypes.STRING, field: 'ContactPerson' },
        PurchaseValue: { type: DataTypes.DECIMAL, field: 'PurchaseValue' },
        CurrentValue: { type: DataTypes.DECIMAL, field: 'CurrentValue' },
        DateAcquired: { type: DataTypes.DATE, field: 'DateAcquired' },
        InstalledOn: { type: DataTypes.DATE, field: 'InstalledOn' },
        InstalledDepartmentId: { type: DataTypes.BIGINT, field: 'InstalledDepartmentId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        Employee: { type: DataTypes.STRING, field: 'Employee' },
        InstallDetails: { type: DataTypes.STRING, field: 'InstallDetails' },
        InstalledBy: { type: DataTypes.STRING, field: 'InstalledBy' },
        VerifiedById: { type: DataTypes.BIGINT, field: 'VerifiedById' },
        ApprovedById: { type: DataTypes.BIGINT, field: 'ApprovedById' },
        InstallationCharges: { type: DataTypes.DECIMAL, field: 'InstallationCharges' },
        OtherInformations: { type: DataTypes.STRING, field: 'OtherInformations' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsLabInterface: { type: DataTypes.BOOLEAN, field: 'IsLabInterface' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
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
            tableName: 'hims_equipmentlist',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (EquipmentList as any).associate = function (models: Models) {
        EquipmentList.belongsTo(models.ReferenceValue, { as: 'AssetType', targetKey: 'ReferenceValueCodeId' });
        EquipmentList.belongsTo(models.ReferenceValue, { as: 'AssetCategory', targetKey: 'ReferenceValueCodeId' });
        EquipmentList.belongsTo(models.ReferenceValue, { as: 'Manufacturer', targetKey: 'ReferenceValueCodeId' });
        EquipmentList.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return EquipmentList;
}
