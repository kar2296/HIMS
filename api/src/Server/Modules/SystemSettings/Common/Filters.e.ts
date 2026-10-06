export enum UserFilters {
    Id, //0
    Name, //1
    Facility, //2
    UserType, //3
    Group, //4
    ActiveStatus, //5
    Department, //6
    IsPrivate, //7
    IsDiscount, //8
    DepartmentCode, //9
    IsPeadiatrician,//10
    IsAnaesthisist, //11
    IsSurgeon, //12
    EmployeeId, //13
    SubDepartmentId, //14
    IsAssetDept,   //15
    SecurityPin, //16
    IsPatientPortalDoctor, //17
    PatientUserType,//18
    Staff,  //19
    IsVirtualUsers,  //20
    VirtualCategoryId, //21
    VirtualSubCategoryId, //22
    PatientId, //23
    EmergencyUsers,
    UserName,
    Mobile,
    DOB,
    TeamId,
    GenderId,
    IsHome,//30
    IsActive,
    NotPatient,
    UserFacility,
    IsExcelUpload
}

export enum UserTeamFilters {
    Id,
    Name,
    UserId,
    IsDefault,
    TeamId,
}

export enum UserTaxDetailFilters {
    Id,
    Name,
    UserId
}

export enum DepartmentFilters {
    Id, //0
    Name, //1
    DepartmentCode,//2
    DepartmentType,//3
    IsParent,//4
    ActiveStatus,//5
    ParentDepartmentId,//6
    IsMRDLocation, //7
    IsAssetDept, //8
    IsAdmittingDept, //9
    IsPatientPortal, //10
    IsBloodBank, //11
    IsEmergency,//12
    IsDiet,//13
    FacilityId,//14
    IsIPClearence
}

export enum OrganizationFilters {
    Id,
    Name,
    Code,
    ActiveStatus
}
export enum ReferenceValueFilters {
    Id,
    Name,
    ReferenceGroupId,
    ReferenceGroupCode,
    Code,
    Description,
    TransactionTypeId,
    ReferenceValueCodeId,
    ObjectTypeId,
    ActiveStatus,
    MultiId
}
export enum ScreenFilters {
    Id,
    Name,
    ModuleId
}
export enum SpecialityFilters {
    Id,
    Name,
    FacilityId,
    SpecialityTypeId,
    ActiveStatus
}
export enum FacilityFilters {
    Id,
    Name,
    FacilityCode,
    ActiveStatus,//3
    AllEntries,
    NameCode,
    IsLabCentre,
    IsMedicineCentre,//7
    IsVAT,
    IsDoctorShare,
    IsAdmissionDate,
    IsAddressSearch,
    OrganizationId//12
}
export enum ModuleFilters {
    Id,
    Name,
    ModuleCode,
    ActiveStatus
}
export enum RoleFilters {
    Id,
    Name,
    RoleCode,
    ActiveStatus,
    FacilityId
}
export enum GroupFilters {
    Id,
    Name,
    GroupCode,
    ActiveStatus,
    eqGrpCode,
    FacilityId
}
export enum ReferenceValueGroupFilters {
    Id,
    Name,
    GroupCode,
    FacilityId,
    ModuleId,
    ActiveStatus
}
export enum FacilityDefaultServiceFilters {
    Id,//0
    Name,//1
    FacilityId,//2
    EncounterTypeId,//3
    VisitTypeId, //4
    GuarantorTypeId, //5
    StatusId, //6
    GuarantorId, //7
}
export enum ControlFilters {
    Id,
    Name,
    Context,
    ApplyRoles,
    Display,
    ActiveStatus,
    ParentControlId
}
export enum FacilitySettingFilters {
    Id,
    Name,
    FacilityId
}
export enum AppInfoFilters {
    Id,
    Name
}
export enum ContextFilters {
    Id,
    Name
}
export enum FacilityPreferenceFilters {
    Id,
    Category,
    PreferenceKey,
    FacilityId,
    PreferenceKeys
}
export enum BillingSettingFilters {
    Id,
    FacilityId
}
export enum FacilityPreferenceMasterFilters {
    Id,
    Category,
    PreferenceKey
}
export enum UserPreferenceFilters {
    Id,
    UserId,
    PrefKey,
    PrefValue
}
export enum EventDashboardFilters {
    Id,
    EventDirectionId,
    EventStatusId,
    EventTypeId,
    EventSourceId,
    EventDataType,
    EventData,
    EventMessage
}
export enum RolePrivilegeFilters {
    Id,
    RoleId,
    RoleCode,
    AccessObjectTypeId,
    FacilityId,
}
export enum LoginSessionFilters {
    Id,
    UserId
}
export enum EventTemplateFilters {
    Id,
    FacilityId,
    EventTypeId,
    ModuleName,
    TemplateKey,
    IsActive
}
export enum CronStatusFilters {
    Id,
    Name
}
export enum UserDefaultServiceFilters {
    Id,//0
    Name,//1
    UserId, //2
    FacilityId,//3
    EncounterTypeId,//4
    VisitTypeId, //5
    GuarantorTypeId, //6
    StatusId, //7
    GuarantorId, //8
}
export enum UserCategoryMapFilters {
    UserId,
    ActiveStatusId,
}
export enum RoleMobileConfigMapFilters {
    MobileConfigId,
    RoleId,
}
export enum MessageFilters {
    Id,
    FacilityId,
    MessageStatusId,
    FromUserId,
    ToUserId,
    UserTypeId,
    ToFacilityId
}
export enum OtpVerifyFilters {
    Id,
    Mobile
}
export enum UserFacilityMapFilters {
    UserId,
    FacilityId,
    UserName,
    ActiveStatusId
}
