export enum AllergyFilters {
    Id,
    Name,
    AllergyType,
    ActiveStatus,
}

export enum ChiefComplaintFilters {
    Id,
    Name,
    ChiefComplaintCategory,
    ActiveStatus,
    NameExact
}

export enum AllergyReactionFilters {
    Id,
    Name,
    AllergyReactionType,
    ActiveStatus
}

export enum DiagnosisFilters {
    Id,
    Name,
    DiagnosisCodeScheme,
    Code,
    DiagnosisVersion,
    ActiveStatus,
    TypeId,
    DepartmentId,
    GenderId,
    EncounterTypeId,
    AgeFrom,
    AgeTo,
    NoDept,
    IsActive
}

export enum ProcedureFilters {
    Id,
    Name,
    ProcedureCodeScheme,
    Code,
    ProcedureType,
    ActiveStatus,
    ProcedureCategoryId,
    Speciality,
    IsCathlabProcedures,
    FacilityId
}

export enum AttachmentTypeFilters {
    Id,
    Name,
    Department,
    ActiveStatus
}

export enum GenericMasterFilters {
    Id,
    Name,
    AllergenType,
    ActiveStatus,
    ScheduleTypeId,
    IsPrescribed
}

export enum ImmunizationFilters {
    Id,
    Name,
    ActiveStatus,
    ImmunizationFrequency,
    ImmunizationCondition
}
export enum ImmunizationScheduleFilters {
    Id,
    Name,
    ScheduleId,
    ActiveStatus
}
export enum VitalMasterFilters {
    Id,
    Name,
    VitalValueType,
    ActiveStatus
}

export enum DrugMasterFilters {
    Id,
    Name,
    DrugType,
    ActiveStatus,
    GenericId,
    PharmacyId,
    DrugName,
    IsCalculateFrequencyQty,
    GenericName
}

export enum DosageLimitFilters {
    Id,
    Name,
    DrugId
}

export enum DrugAlertFilters {
    Id,
    Name,
    DrugId
}

export enum ProcedureAliasFilters {
    Id,
    Name,
    ProcedureId
}

export enum ProcedureTemplateFilters {
    Id,
    Name,
    ProcedureId
}

export enum DrugFrequencyCategoryFilters {
    Id,
    Name,
    DrugFrequencyId
}

export enum DrugFrequencyFilters {
    Id,
    Name,
    Facility,
    DrugFrequencyType,
    ActiveStatus
}

export enum TickSheetFilters {
    Id,
    Name,
    Department,
    TickSheetType,
    ActiveStatus,
    TickSheetMasterType,
    AdminTic
}

export enum FavoriteMasterFilters {
    Id,
    Name,
    Facility,
    FavoriteType,
    ActiveStatus,
    User,
    AdminFav
}

export enum FavoriteMasterDetailFilters {
    Id,
    Name,
    FavoriteMasterId
}

export enum TemplateMasterFilters {
    Id,
    Name,
    Facility,
    TemplateType,
    ActiveStatus,
    User,
    AdminFav,
    DepartmentId,
    AccessibleTypeId
}

export enum TemplateMasterDetailFilters {
    Id,
    Name,
    TemplateMasterId
}

export enum FrequencyCategoryFilters {
    Id,
    Name,
    FrequencyId
}

export enum FrequencyMasterFilters {
    Id,
    Name,
    Facility,
    FrequencyType,
    ActiveStatus
}

export enum ServiceRateCategoryFilters {
    Id,
    Name,
    Facility,
    SourceType,
    ActiveStatus,
    AllFacility,
    TariffTypeId,
    EncounterTypeId,
    IsExcelUpload
}

export enum ServiceGroupFilters {
    Id,
    Name,
    Facility,
    SourceType,
    Status,
    ActiveStatus,
    InActiveStatus
}

export enum ServiceCategoryFilters {
    Id,
    Name,
    Facility,
    SourceType,
    ServiceGroup,
    Status,
    ServiceCategory,
    ParentServiceCategoryId,
    AllFacility
}

export enum ServiceItemFilters {
    Id,
    Code,
    DepartmentId,
    CategoryId,
    ActiveStatus,
    MasterItemId,
    Guarantor,
    SubCategoryId,
    FacilityId,
    MasterTypeId,
    SubDepartmentId,
    IsPackage, // 11
    MasterName,
    IsEquipment,
    IsDoctorDisplay,
    IsOrderable,
    IsRateEditable,
    IsZeroBill,
    IsSurgicalProcedure,
    IsEquipmentHour,
    IsEquipmentDaily,
    IsBedChargeHour,
    IsBedChargeDaily,
    IsNightCharge,
    CanDiscountProportionate,
    IsInstrument,
    NameStartwith,
    IsSaveServiceDetails, //27
    IsPhysiotheraphy,
    IsExecutableProcedure,
    ServiceRateCategory,
    IsVirtualService,
    VirtualCategoryId,
    VirtualsubCategoryId,
    Facility,
    IncludeRate,
    IsExcelUpload
}

export enum ServiceItemAliasFilters {
    Id,
    Name,
    ServiceItemId,
    AliasTypeId,
    ExternalProviderId,
}

export enum ServiceItemTariffDetailFilters {
    Id,//0
    Name,//1
    ServiceItemId,//2
    ServiceRateCategory,//3
    EncounterTypeId,//4
    FacilityId, //5
    TariffTypeId
}

export enum ServiceItemPackageMapFilters {
    Id,
    Name,
    ServiceItemId
}
export enum NoteTemplateFilters {
    Id,
    NoteType,
    Code,
    Department,
    ActiveStatus,
    SubDepartmentId
}
export enum ProfileMasterFilters {
    Id,
    Name,
    ProfilemasterType,
    ActiveStatusId,
    ProfileType,
    IsIVF,
    FacilityId
}
export enum SectionMasterFilters {
    Id,
    Name,
    ParentSectionId,
    SectionTypeId,
    DockPositionId,
    SectionNoteTypeId
}
export enum ProfileSectionSettingFilters {
    Id,
    ProfileId,
    SectionId
}
export enum ProfileSectionFilters {
    Id,
    Name,
    ProfileId
}
export enum TickSheetMasterFilters {
    Id,
    Name,
    FacilityId,
    TickSheetType,
    ActiveStatus,
    TickSheetMasterType,
    AdminTic,
    Department,
    AdditionalInfo,
    PharmacyId,
    AccessibleTypeId,
    AllFacility
}
export enum TickSheetMasterDetailFilters {
    Id,
    Name,
    TickSheetMasterId
}
export enum CategoryTypeMasterFilters {
    Id,
    Name,
    CategoryTypeRef,
    ActiveStatus
}
export enum DietItemMasterFilters {
    Id,
    DietItemTypeId,
    DietCategoryId,
    ActiveStatusId,
    DietItemCode,
    IncludeServiceDetails
}
export enum CategoryFilters {
    Id,
    Name,
    CategoryTypeId,
    ActiveStatus,
    IdArr,
    CategoryType
}
export enum ConceptFilters {
    Id,
    Name,
    Category
}
export enum TermFilters {
    Id,
    Name,
    Concept
}
export enum IPPackageFilters {
    Id,
    PackageCode,
    GuarantorTypeId,
    GuarantorId,
    FacilityId,
    ActiveStatusId,
    ActiveFrom,
    ActiveTo,
    DepartmentId
}
export enum IPPackageDetailFilters {
    Id,
    IPPackageId,
    IPPackageTariffDetailId
}
export enum IPPackageTariffDetailFilters {
    Id,
    IPPackageId,
    GuarantorTypeId
}
export enum IPPackageServiceInclusionFilters {
    Id,
    IPPackageId,
    ServiceCategoryId
}
export enum IPPackageServiceExclusionFilters {
    Id,
    IPPackageId,
    ServiceCategoryId
}
export enum AssessmentFilters {
    Id,
    Name,
    DepartmentId,
    ActiveStatusId
}
export enum CarePathFilters {
    Id,
    Name,
    DepartmentId,
    ActiveStatusId,
    CarePathTypeId
}
export enum CarePathAssessmentFilters {
    Id,
    CarePathId
}
export enum CarePathClinicalOrderFilters {
    Id,
    CarePathId
}
export enum CarePathPrescriptionFilters {
    Id,
    CarePathId
}
export enum CarePathProcedureFilters {
    Id,
    CarePathId
}
export enum CarePathSectionFilters {
    Id,
    CarePathId
}
export enum ProfileUserFilters {
    Id,
    Name,
    ProfileId,
    FacilityId,
    DepartmentId,
    UserId,
    VisitTypeId,
    DefaultProfile,
    IsDefault,
    ProfileType//9
}
export enum ChiefComplaintCategoryMapFilters {
    Id,
    Name,
    ChiefComplaintIds,
    CategoryId
}
export enum FitnessCertificateFilters {
    Id,
    PatientNameMRN,
    PatientId,
    CertificateStatus,
    NoteTemplateId
}
export enum ABGParametersFilters {
    Id,
    Name,
    ParameterTypeId,
    ActiveStatusId,
    FacilityId
}
export enum ClinicalFindingFilters {
    Id,
    Name,
    FindingTypeId,
    DepartmentId,
    ActiveStatusId,
}
export enum ImpressionMasterFilters {
    Id,
    Name,
    ImpressionTypeId,
    DepartmentId,
    ActiveStatusId,
}
export enum SystemExaminationFilters {
    Id,
    Code,
    ImpressionTypeId,
    SysExaminationTypeId,
    ActiveStatusId,
}
export enum ServiceItemPerformingDoctorFilters {
    Id,//0
    DoctorName,//1
    VisitTypeId,//2
    StatusId,//3
    FacilityId, //4
    ServiceItemId,//5
    ServiceRateCategoryId
}
export enum ExaminationMasterFilters {
    Id,
    Name,
    ExaminationMasterType,
    ActiveStatus
}
export enum DefaultNotesFilters {
    Id,
    DefaultNoteType,
    ActiveStatus
}
