export enum RemarkFilters {
    Id,
    Name,
    Facility,
    RemarkType,
    Screen,
    ActiveStatus
}

export enum ResourceMasterFilters {
    Id,
    Name,
    Facility,
    ResourceType,
    Department,
    ActiveStatus
}

export enum PincodeMasterFilters {
    Id,
    Name,
    Country,
    State,
    City,
    Pincode,
    Area,
    PincodeArea,
    ActiveStatus,
    District
}

export enum StateMasterFilters {
    Id,
    Name,
    Country,
    StateCode,
    StateName,
    ActiveStatus
}

export enum DistrictMasterFilters {
    Id,
    Name,
    State,
    City,
    DistrictName,
    Country,
    ActiveStatus,
    DistrictCode
}

export enum ReferralFilters {
    Id,
    Name,
    Facility,
    ReferralType,
    MarketingPerson,
    ActiveStatus,
    IsDefault,
    IsActive,
    OtherSelfReferralId
}
export enum ReferralChargeFilters {
    Id,
    ReferralId,
    FacilityId
}

export enum ResearchProjectFilters {
    Id,
    Name,
    Facility,
    ProjectType,
    ActiveStatus
}

export enum ResearchProjectMemberFilters {
    Id,
    Name,
    ResearchProjectId
}

export enum GuarantorFilters {
    Id,
    Name,
    GuarantorTypeId,
    GuarantorCode,
    TPAId,
    ActiveStatus,
    IsSelf,
    FacilityId,
    ContractExpiryDate,
    From,
    To,
    AllFacility,
    IsExcelUpload
}

export enum GuarantorGSTFilters {
    Id,
    Name,
    GuarantorId
}

export enum LocationMasterFilters {
    Id,
    LocationName,
    FacilityId,
    ActiveStatusId
}

export enum RoomTypeMasterFilters {
    Id,
    RoomTypeName,
    FacilityId,
    ServiceRateCategoryId,
    ActiveStatusId
}

export enum WardMasterFilters {
    Id,//0
    WardTypeId,//1
    FacilityId,//2
    ActiveStatusId,//3
    WardName,//4
    LocationId,//5
    IsDashBoard,//6
    WardMasterTypeId, //7
    IsTempWard, //8
}

export enum WardRoomMasterFilters {
    Id,
    RoomTypeId,
    WardId,
    LocationId,
    FacilityId,
    ActiveStatusId,
    WardMasterTypeId
}

export enum WardRoomBedMasterFilters {
    Id,
    WardId,
    RoomId,
    FacilityId,
    ActiveStatus,
    BedStatusId,
    LocationId,
    IsTemp,
    WardMasterTypeId,
    ActiveStatusId,
    IsActive
}

export enum WardUserMapFilters {
    Id,
    UserId,
    FacilityId,
    WardId,
    UserTypeId,
    ActiveStatus,
    WardType,
    WardMasterTypeId
}

export enum WardRoomServiceMapFilters {
    Id,
    RoomId,
    WardId,
    ServiceItemId,
    ActiveStatus
}

export enum PatientAlertFilters {
    Id,
    AlertTypeId,
    SeverityId,
    PriorityId,
    PatientId,
    DepartmentId,
    UserId,
    SkipPatient,
    IsValidAlerts
}
export enum CityMasterFilters {
    Id,
    Name,
    State,
    District,
    CityName,
    Country,
    ActiveStatus,
    CityCode
}
export enum BedStatusFilters {
    Id,
    FacilityId,
    LocationId,
    Floor,
    WardId,
    MRN,
    DoctorId,
    RoomTypeId
}

export enum FeedbacksMasterFilters {
    Id,
    FacilityId,
    FeedbackCategoryId,
    FeedbackTypeId,
    ActiveStatusId,
    Description
}

export enum GuarantorSupplementaryFilters {
    Id,
    GuarantorId,
    SupplementaryTypeId,
    ItemMasterId,
    ServiceCategoryId,
    ItemCategoryId

}
export enum CountryMasterFilters {
    Id,
    Name,
    CountryCode,
    CountryName,
    ActiveStatus
}

export enum GuarantorChecklistFilters {
    Id,
    GuarantorId
}
export enum CardMasterFilters {
    Id,
    Code,
    Facility,
    CardMasterType,
    ActiveStatus,
    GuarantorId
}
export enum GuarantorAgreementFilters {
    Id,
    GuarantorId
}
export enum GuarantorCardTypeFilters {
    Id,
    TPAId,
    ActiveStatus,
    GuarantorId
}
export enum GuarantorCustomerFilters {
    Id,
    GuarantorId,
    ActiveStatusId,
    CustomerTypeId,
    CustomerName
}
export enum GuarantorCustomerCardFilters {
    Id,
    GuarantorId,
    ActiveStatusId
}
export enum GuarantorCustomerCardDeductableFilters {
    Id,
    GuarantorId
}
export enum OccupationFilters {
    Id,
    ActiveStatusId,
    Occupations,
    OccupationTypeId
}
export enum CheckListFilters {
    Id,
    FacilityId,
    ActiveStatusId,
    CheckListTypeId,
    CheckListCategoryId
}
export enum ClinicalRemarkFilters {
    Id,
    Remarks,
    Facility,
    RemarkType,
    ActiveStatus
}
export enum SystemMasterFilters {
    Id,
    SystemName,
    Facility,
    SystemTypeId,
    ActiveStatus
}
export enum WardInsuranceTariffFilters {
    Id,
    WardId,
    InsuranceId,
    RateTypeId,
    FacilityId,
    AllFacility,
    GuarantorTypeId
}
