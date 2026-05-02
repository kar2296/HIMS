export enum AssetFilters {
    Id,
    AssetTypeId,//1
    AssetCategoryId,//2
    DepartmentId,//3
    ActiveStatus,//4
    ModelNum,//5
    ModelName,//6
    Description,//7
    Manufacturer,//8
    Serial,//9
    PONum,//10
    GRNNum,//11
    PurchaseValue,//12
    CurrentValue,//13
    AssetName,//14
    ShortCode,
    IsLabInterface,
    FacilityId,//17
    EmployeeId,//18
    CreatedAt,//19
    From,//20
    To,//21
    DisAsset //22
}
export enum EquipmentListFilters {
    Id,
    AssetTypeId,//1
    AssetCategoryId,//2
    DepartmentId,//3
    ActiveStatus,//4
    ModelNum,//5
    ModelName,//6
    Description,//7
    Manufacturer,//8
    Serial,//9
    PONum,//10
    GRNNum,//11
    PurchaseValue,//12
    CurrentValue,//13
    AssetName,//14
    ShortCode,
    IsLabInterface,
    FacilityId//17
}
export enum AssetWarrantyFilters {
    Id,
    WarrantyTypeId,//1
    FromDate,//2
    ToDate,//3
    ActiveStatusId,//4
    AssetId,//5
    FacilityId,//6
    EmployeeId,//7
    DepartmentId,//8
    ToWarrantyDate,
    FromWarranty,
    ToWarranty,
    AssetTypeId
}
export enum AssetMaintananceFilters {
    Id,
    AssetId,
    FacilityId,
    MaintananceDate,
    From,
    To
}
export enum AssetAccessoriesFilters {
    Id,
    AssetId,
    FacilityId,
    AssetCategoryId,
    AssetTypeId,
    FromWarrantyto,
    ToWarrantyto,
    InstalledDepartmentId
}
export enum AssetDocumentFilters {
    Id,
    AssetId,
    FacilityId
}
export enum AssetTransferFilters {
    Id,
    FromDepartmentId,//1
    AssetName,//2
    AssetTransferStatus,//3
    ToDepartment,//4
    AssetId,//5
    FromFacilityId,//6
    TransferedDate,//7
    From,//8
    To,//9
    TransferedById,//10
    AssetTransferStatusId,//11
    AssetCategoryId,
    AssetTypeId
}
export enum ServiceRequestFilters {
    Id, //0
    FromDepartmentId,//1
    ServiceTypeId,//2
    ExpectedDate,//3
    AssetTicketStatusId,//4
    TicketNumberIdentifier,//5
    CreatedAt,//6
    AssignTypeId,//7
    PriorityId,//8
    WorkOrderId,//9
    AssignedId,//10
    AssetId, //11
    ShortCode,  //12
    AssetName, //13
    FacilityId,  //14
    CategoryId, //15
    From, //16
    To,  //17
    ToDepartmentId,  //18
    CreatedBy,   //19
    TicketStatus,  //20
    PhoneNo,  //21
    RequestedBy,  //22
    ResolvedBy, //23
    CreatedResolved,   //24
    CretedAssigned   //25
}
export enum AssetAuditFilters {
    Id,
    AssetId,
    DepartmentId,
    LOCATIONId,
    StartDate,
    AuditName,
    AuditStatusId,
    FacilityId,
    From,
    To,
    AuditNameId
}
export enum AssetAuditDetailFilters {
    Id,
    AssetId,
    AssetAuditId,
    StartDate,
    DepartmentId,
    From,
    To,
    AuditNameId,
    FacilityId,
    AssetCategoryId,
    AssetTypeId
}
export enum EscalationMatrixFilters {
    Id,
}
export enum GatePassFilters {
    Id,
    GatePassTypeId,
    AssetId,
    GatePassStatusId,
    GatePassNo,
    GatePassDate,
    From,
    To,
    DepartmentId,
    FacilityId,
    AssetTypeId
}
export enum AssetDisposeFilters {
    Id,
    DisposeGroupId,
    DisposeStatusId,
    AssetName,
    DepartmentId,
    FacilityId,
    From,
    To,
    AssetTypeId,
    DisposeTypeValue
}
export enum AssetInsuranceFilters {
    Id,
    ActiveStatusId,//1
    AssetId,//2
    AssetTypeId,//3
    DepartmentId,//4
    EmployeeId,//5
    AssetCategoryId
}
export enum PreferencesFilters {
    Id,
}
export enum NewAssetRequestFilters {
    Id,
    AssetName,
    DepartmentId,
    ManufacturerId,
    AssetRequestStatusId,
    RequestedDate,
    From,
    To,
    // AssetCategoryId,
    // AssetTypeId,
    FacilityId
}





