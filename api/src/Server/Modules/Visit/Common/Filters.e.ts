export enum EncounterFilters {
    Id,//0
    FacilityId,//1
    WardId,//2
    AdmissionStatusId,//3
    PatientId,//4
    DoctorId,//5
    DepartmentId,//6
    ServiceRateCategoryId,//7
    AdmissionTypeId,//8
    DiagnosisId,//9
    AttenderName,//10
    PatientNameMRN,//11
    RequestIdentifier,//12
    VisitIdentifier,//13
    EncounterStatus,//14
    EncounterTypeId,//15
    AdmissionDate,//16
    From,//17
    To,//18
    GuarantorId,//19
    AttenderPhone,//20
    Phone,//21
    IncludeBillDetails,//22
    GuarantorTypeId,//23
    DOD,//24
    BedId,//25
    IncludePatientCertifiate,//26
    DischargeTypeId,//27,
    FromDOD,//28
    ToDOD,//29
    AppointmentId,//30
    BedBoardAdmissionStatus,//31
    RoomId, //32
    WardMasterTypeId,//33
    MultiGuarantorType,//34
    IncludeDoctors,//35
    OpenEncounter,//36
    IsBillLock,//37
    AdmissionStatus,//38
    BillNumber,//39
    IncludePaymentDetails,//40
    ReferralId,//41
    IsReadmission,//42
    CertificateStatusId,  //43
    IsPaidVisit,  //44
    FreeVisit,  //45
    IsEstimatedBill,//46
    IsSurgery,//47
    TeamId, //48
    IsRegCumBill, //49
    IsAdditionalVisit, //50
    IsBillModified, //51
    IsLatest, //52
    GenderId, //53
    VisitTypeId, //54
    OtherSelfReferralId,  //55
    ReferralTypeId,
    OnlyDiagnosis,   //57
    IsPackageAssigned,  //58
    IsMLC,
    TpaId,
    ISMRDReturn,
    FromAdmandToDisc,
    DischargeDate,
    IncludeBillPharmacyInfoDetails,
    IsPharmacyClearance,
    BillingStatusId,
    IncludeBillSummary,
    PatientTypeId,
    IsDayCare,
    IsPaidFully,
    IsEmergencyVisit,
    IsFromDayCare,
    IPnumsort,
    Billnumbersort,
    SortByCreated,//75
    RemarkId,
    NotSelfRefType,
    listGovt,
    NotDepartmentId,
    FromBillDate,
    ToBillDate,
    BillUnlockRequestStatus,
    CreatedFrom,
    CreatedTo
}
export enum EncounterMLCFilters {
    Id,
    PatientId,
    MLCNo,
    EncounterId,
    ConsultationId
}
export enum EncounterMLCOfficerFilters {
    Id,
    EncounterMlcId,
    EncounterId,
}
export enum EncounterDoctorFilters {
    Id,
    Name,
    AppointmentStatus,
    PatientName,
    ConsultationStatus,//4
    VisitDate,
    EncounterId,
    AppointmentId,
    AdmissionDate,
    OPOnly,
    FacilityId,//10
    StartDate,
    DepartmentId,
    DoctorId,//13
    TeamId,
    VisitTypeId,
    PatientId,
    From,
    To,//18
    EncounterTypeId,
    EncounterType,//20
    EncounterStatusId,
    VisitStartDate,
    IsVirtualConsultation,
    VirtualCategoryId,
    OrderRequestDate,
    FromOrderReq,
    ToOrderReq,
    OrderScheduleDate,
    FromOrderSch,
    ToOrderSch,
    EncDoctorStatus,
    IsEmergencyVisit,
    VirtualOrderId,
    BillingStatusId//34
}
export enum EncounterPackageFilters {
    Id,
    EncounterId,
    PackageId,
    PatientId
}
export enum EncounterIPPackageFilters {
    Id,
    IPPackageCode,
    GuarantorTypeId,
    GuarantorName,
    FacilityId,
    ActiveStatusId,
    EncounterId,
    PatientId
}
export enum EncounterIPPackageDetailFilters {
    Id,
    EncounterIPPackageId,
    ServiceCategoryId
}
export enum EncounterIPPackageServiceInclusionFilters {
    Id,
    EncounterIPPackageDetailId,
    ServiceCategoryId,
    PatientBillDetailId,
    ServiceItemId,
    ActiveStatusId,
    BillStatusId
}
export enum EncounterIPPackageServiceExclusionFilters {
    Id,
    EncounterIPPackageDetailId,
    ServiceCategoryId,
    PatientBillDetailId,
    ServiceItemId,
    ActiveStatusId,
    BillStatusId
}
export enum EncounterIPPackageServiceNonMedicalFilters {
    Id,
    EncounterIPPackageDetailId,
    ServiceCategoryId,
    PatientBillDetailId,
    ServiceItemId,
    ActiveStatusId,
    BillStatusId
}
export enum PatientCommentFilters {
    Id,
    PatientId
}
