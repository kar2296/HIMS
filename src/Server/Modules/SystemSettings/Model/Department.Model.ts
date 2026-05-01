import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DepartmentInstance, i.DepartmentAttributes> {
    let Department = sequelize.define<i.DepartmentInstance, i.DepartmentAttributes>('Department', {
        Id: { type: DataTypes.BIGINT, field: 'DepartmentId', primaryKey: true, autoIncrement: true },
        ParentDepartmentId: { type: DataTypes.BIGINT, field: 'ParentDepartmentId' },
        DepartmentCode: { type: DataTypes.STRING, field: 'DepartmentCode' },
        DepartmentName: { type: DataTypes.STRING, field: 'DepartmentName' },
        DepartmentTypeId: { type: DataTypes.INTEGER, field: 'DepartmentTypeId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId' },
        PhoneNo: { type: DataTypes.STRING, field: 'PhoneNo' },
        IsEmergency: { type: DataTypes.BOOLEAN, field: 'IsEmergency' },
        IsAdmittingDept: { type: DataTypes.BOOLEAN, field: 'IsAdmittingDept' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        IncludeMRDRequired: { type: DataTypes.BOOLEAN, field: 'IncludeMRDRequired' },
        IsPatientFlowMandatory: { type: DataTypes.BOOLEAN, field: 'IsPatientFlowMandatory' },
        IsProcessingCenter: { type: DataTypes.BOOLEAN, field: 'IsProcessingCenter' },
        IsIPClearence: { type: DataTypes.BOOLEAN, field: 'IsIPClearence' },
        CostCenterId: { type: DataTypes.BIGINT, field: 'CostCenterId' },
        URL: { type: DataTypes.STRING, field: 'URL' },
        IsMRDLocation: { type: DataTypes.BOOLEAN, field: 'IsMRDLocation' },
        IsAssetDept: { type: DataTypes.BOOLEAN, field: 'IsAssetDept' },
        GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
        ThresholdDuration: { type: DataTypes.INTEGER, field: 'ThresholdDuration' },
        FollowupDays: { type: DataTypes.INTEGER, field: 'FollowupDays' },
        NightStartTime: { type: DataTypes.TIME, field: 'NightStartTime' },
        NightEndTime: { type: DataTypes.TIME, field: 'NightEndTime' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        DepartmentLogo: { type: DataTypes.STRING, field: 'DepartmentLogo' },
        DeptSeqName: { type: DataTypes.STRING, field: 'DeptSeqName' },
        IsParentDepartment: { type: DataTypes.BOOLEAN, field: 'IsParentDepartment' },
        IsVirtual: { type: DataTypes.BOOLEAN, field: 'IsVirtual' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsPatientPortal: { type: DataTypes.BOOLEAN, field: 'IsPatientPortal' },
        IsBloodBank: { type: DataTypes.BOOLEAN, field: 'IsBloodBank' },
        IsDiet: { type: DataTypes.BOOLEAN, field: 'IsDiet' },
        LogoPath: { type: DataTypes.STRING, field: 'LogoPath' },
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
            tableName: 'departments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Department as any).associate = function (models: Models) {
        Department.belongsTo(models.ReferenceValue, { as: 'DepartmentType', targetKey: 'ReferenceValueCodeId' });
        Department.belongsTo(models.ReferenceValue, { as: 'CostCenter', targetKey: 'ReferenceValueCodeId' });
        Department.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        Department.belongsToMany(models.User, { through: models.UserDepartmentMap });
        Department.belongsTo(models.Department, { as: 'ParentDepartment', foreignKey: 'ParentDepartmentId' });
        Department.belongsTo(models.Facility, { as: 'Facility', foreignKey: 'FacilityId' });
        Department.belongsTo(models.Speciality, { foreignKey: 'SpecialityId' });
    };
    return Department;
}
