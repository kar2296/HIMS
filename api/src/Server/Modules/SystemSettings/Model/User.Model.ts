import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserInstance, i.UserAttributes> {
    let User = sequelize.define<i.UserInstance, i.UserAttributes>('User', {
        Id: { type: DataTypes.BIGINT, field: 'UserId', primaryKey: true, autoIncrement: true },
        TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
        FirstName: { type: DataTypes.STRING, field: 'FirstName' },
        MiddleName: { type: DataTypes.STRING, field: 'MiddleName' },
        LastName: { type: DataTypes.STRING, field: 'LastName' },
        Age: { type: DataTypes.INTEGER, field: 'Age' },
        DOB: { type: DataTypes.DATE, field: 'DOB' },
        PreferredLanguageId: { type: DataTypes.INTEGER, field: 'PreferredLanguageId' },
        Qualification: { type: DataTypes.STRING, field: 'Qualification' },
        NationalityId: { type: DataTypes.INTEGER, field: 'NationalityId' },
        CategoryId: { type: DataTypes.INTEGER, field: 'CategoryId' },
        DoctorShareClassId: { type: DataTypes.INTEGER, field: 'DoctorShareClassId' },
        ActionFrom: { type: DataTypes.DATE, field: 'ActionFrom' },
        ActionTo: { type: DataTypes.DATE, field: 'ActionTo' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        Pincode: { type: DataTypes.STRING, field: 'Pincode' },
        Area: { type: DataTypes.STRING, field: 'Area' },
        City: { type: DataTypes.STRING, field: 'City' },
        District: { type: DataTypes.BIGINT, field: 'District' },
        State: { type: DataTypes.STRING, field: 'State' },
        Country: { type: DataTypes.STRING, field: 'Country' },
        LandLine: { type: DataTypes.STRING, field: 'LandLine' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        Email: { type: DataTypes.STRING, field: 'Email' },
        Experience: { type: DataTypes.STRING, field: 'Experience' },
        PANNo: { type: DataTypes.STRING, field: 'PANNo' },
        AccountNo: { type: DataTypes.STRING, field: 'AccountNo' },
        IFSCCode: { type: DataTypes.STRING, field: 'IFSCCode' },
        BankName: { type: DataTypes.STRING, field: 'BankName' },
        AdditionalPhoneNo: { type: DataTypes.STRING, field: 'AdditionalPhoneNo' },
        LicenseNo: { type: DataTypes.STRING, field: 'LicenseNo' },
        Designation: { type: DataTypes.STRING, field: 'Designation' },
        LicenseIssueDate: { type: DataTypes.DATE, field: 'LicenseIssueDate' },
        LicenseExpiryDate: { type: DataTypes.DATE, field: 'LicenseExpiryDate' },
        IsAdmittingConsultant: { type: DataTypes.BOOLEAN, field: 'IsAdmittingConsultant' },
        IsVisistingConsultant: { type: DataTypes.BOOLEAN, field: 'IsVisistingConsultant' },
        IsSurgeon: { type: DataTypes.BOOLEAN, field: 'IsSurgeon' },
        IsPeadiatrician: { type: DataTypes.BOOLEAN, field: 'IsPeadiatrician' },
        IsAnaesthisist: { type: DataTypes.BOOLEAN, field: 'IsAnaesthisist' },
        OrgId: { type: DataTypes.BIGINT, field: 'OrgId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        VirtualCategoryId: { type: DataTypes.BIGINT, field: 'VirtualCategoryId' },
        OPDRoomId: { type: DataTypes.BIGINT, field: 'OPDRoomId' },
        VirtualSubCategoryId: { type: DataTypes.BIGINT, field: 'VirtualSubCategoryId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        UserGroupId: { type: DataTypes.BIGINT, field: 'UserGroupId' },
        ClinicalRoleId: { type: DataTypes.BIGINT, field: 'ClinicalRoleId' },
        UserTypeId: { type: DataTypes.BIGINT, field: 'UserTypeId' },
        SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId' },
        Image: { type: DataTypes.STRING, field: 'Image' },
        Signature: { type: DataTypes.STRING, field: 'Signature' },
        UserName: { type: DataTypes.STRING, field: 'UserName' },
        Password: { type: DataTypes.STRING, field: 'Password' },
        SecurityPin: { type: DataTypes.STRING, field: 'SecurityPin' },
        TabletAccess: { type: DataTypes.BOOLEAN, field: 'TabletAccess' },
        MobileAccess: { type: DataTypes.BOOLEAN, field: 'MobileAccess' },
        LoginPermission: { type: DataTypes.BOOLEAN, field: 'LoginPermission' },
        BillingCounterId: { type: DataTypes.INTEGER, field: 'BillingCounterId' },
        BillingCounterStatusId: { type: DataTypes.INTEGER, field: 'BillingCounterStatusId' },
        GenderId: { type: DataTypes.BOOLEAN, field: 'GenderId' },
        PhotoPath: { type: DataTypes.STRING, field: 'PhotoPath' },
        SignPath: { type: DataTypes.STRING, field: 'SignPath' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsHome: { type: DataTypes.BOOLEAN, field: 'IsHome' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PinCodeId: { type: DataTypes.BIGINT, field: 'PinCodeId' },
        CityId: { type: DataTypes.BIGINT, field: 'CityId' },
        DistrictId: { type: DataTypes.BIGINT, field: 'DistrictId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        PrivateDueLimit: { type: DataTypes.DECIMAL, field: 'PrivateDueLimit' },
        DiscountLimit: { type: DataTypes.DECIMAL, field: 'DiscountLimit' },
        DiscountModeId: { type: DataTypes.INTEGER, field: 'DiscountModeId' },
        IsPrivate: { type: DataTypes.BOOLEAN, field: 'IsPrivate' },
        IsDefaultPrivateDue: { type: DataTypes.BOOLEAN, field: 'IsDefaultPrivateDue' },
        IsPharmacyDueAllowed: { type: DataTypes.BOOLEAN, field: 'IsPharmacyDueAllowed' },
        IsDiscount: { type: DataTypes.BOOLEAN, field: 'IsDiscount' },
        IsTDS: { type: DataTypes.BOOLEAN, field: 'IsTDS' },
        TDSId: { type: DataTypes.INTEGER, field: 'TDSId' },
        Staff: { type: DataTypes.BOOLEAN, field: 'Staff' },
        BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
        PaidAmount: { type: DataTypes.DECIMAL, field: 'PaidAmount' },
        OutStandingAmount: { type: DataTypes.DECIMAL, field: 'OutStandingAmount' },
        IsPatientPortalDoctor: { type: DataTypes.BOOLEAN, field: 'IsPatientPortalDoctor' },
        EmployeeId: { type: DataTypes.BIGINT, field: 'EmployeeId' },
        QmsLocationId: { type: DataTypes.BIGINT, field: 'QmsLocationId' },
        PrescriptionAdvice: { type: DataTypes.STRING, field: 'PrescriptionAdvice' },
        DoctorClassId: { type: DataTypes.BIGINT, field: 'DoctorClassId' },
        IsIncludeTax: { type: DataTypes.BOOLEAN, field: 'IsIncludeTax' },
        IsVirtualUsers: { type: DataTypes.BOOLEAN, field: 'IsVirtualUsers' },
        IsDueCheck: { type: DataTypes.BOOLEAN, field: 'IsDueCheck' },
        NotificationToken: { type: DataTypes.STRING, field: 'NotificationToken' },
        TeamId: { type: DataTypes.BIGINT, field: 'TeamId' },
        AadharNumber: { type: DataTypes.BIGINT, field: 'AadharNumber' },
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' },
        FailedLoginAttempts: { type: DataTypes.INTEGER, field: 'FailedLoginAttempts' },
        IsLocked: { type: DataTypes.BOOLEAN, field: 'IsLocked' },
        RequiresPasswordChange: { type: DataTypes.BOOLEAN, field: 'RequiresPasswordChange' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'users',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (User as any).associate = function (models: Models) {
        User.belongsTo(models.Facility);
        User.belongsTo(models.Organization, { foreignKey: 'OrgId' });
        //User.belongsTo(models.Employee);
        User.belongsTo(models.Department, { as: 'Department' });
        User.belongsTo(models.Department, { as: 'UserDept', foreignKey: 'DepartmentId' });
        User.belongsTo(models.Department, { as: 'SubDepartment', foreignKey: 'SubDepartmentId' });
        User.belongsTo(models.VirtualCategory, { foreignKey: 'VirtualCategoryId' });
        User.belongsTo(models.VirtualSubCategory, { foreignKey: 'VirtualSubCategoryId' });
        User.belongsTo(models.GstMaster, { foreignKey: 'TDSId' });
        User.belongsTo(models.ReferenceValue, { as: 'DoctorClass', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.ReferenceValue, { as: 'Title', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.ReferenceValue, { as: 'OPDRoom', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.ReferenceValue, { as: 'QmsLocation', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.ReferenceValue, { as: 'UserType', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.Group, { foreignKey: 'UserGroupId' });
        User.hasMany(models.UserDefaultService, { as: 'Service', foreignKey: 'UserId' });
        User.belongsTo(models.ReferenceValue, { as: 'ClinicalRole', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.ReferenceValue, { as: 'Team', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
        User.belongsTo(models.ReferenceValue, { as: 'DoctorShareClass', targetKey: 'ReferenceValueCodeId' });
        //User.hasMany(models.UserDepartmentMap, { as : 'Departments' }); //TODO: remove
        User.belongsToMany(models.Department, { through: models.UserDepartmentMap, as: 'Departments' });
        User.belongsTo(models.Speciality, { foreignKey: 'SpecialityId' });
        User.belongsTo(models.ReferenceValue, { as: 'DiscountMode', targetKey: 'ReferenceValueCodeId' });
        User.hasMany(models.AppointmentMultiSession, { as: 'AppointmentSessions', foreignKey: 'DoctorId' });
        User.belongsTo(models.UserFacilityMap, { foreignKey: 'UserId', targetKey: 'UserId' });
    };
    return User;
}
