export enum PatientFilters {
    Id, //0
    Name, //1
    MRN, //2
    DOB, //3
    PhoneNumber, //4
    VisitID, //5
    RegisteredDate, //6
    PatientStatus, //7
    IncludeAppointments, //8
    From, //9
    To, //10
    ReferrerId, //11
    VisitDate, //12
    VisitType, //13
    GuarantorId, //14
    IsAdmitted, //15
    Pincode, //16
    CountryName, //17
    StateName, //18
    CityTownName, //19
    Area, //20
    AppointmentStatus, //21
    ConsultationStatus, //22
    ShowTempPatient, //23
    IsVistInProgress, //24
    IsBillOutStanding, //25
    NRIC,   //26
    visiteddate,  //27
    EncFacilityId, // 28
    PatFacilityId, // 29
    GuardianName,//30
    VisitTypeId, //31
    MRNShortCode, //32
    FromDate, //33
    ToDate, //34
    Staff,//35
    UserId, //36
    MRNTypeId, //37
    FamilyUniqueId,
    ParentPatientId,
    CardNo,
    CreatedAt,
    FromCre,
    ToCre,
    IsEmergencyPatient,
    MRNTypes,//45
    IsExcelUpload
}
export enum PatientMergeFilters {
    Id, //0
    Name, //1
    MRN, //2
    DOB, //3
    PhoneNumber, //4
    VisitID, //5
    RegisteredDate, //6
    PatientStatus, //7
    IncludeAppointments, //8
    From, //9
    To, //10
    ReferrerId, //11
    VisitDate, //12
    VisitType, //13
    GuarantorId, //14
    IsAdmitted, //15
    Pincode, //16
    CountryName, //17
    StateName, //18
    CityTownName, //19
    Area, //20
    AppointmentStatus, //21
    ConsultationStatus, //22
    ShowTempPatient, //23
    TransactionId, //24
    PatientId, //25
    NRIC,   //26
    visiteddate,  //27
    EncFacilityId, // 28
    PatFacilityId, // 29
    GuardianName,//30
    VisitTypeId, //31
    MRNShortCode, //32
}

export enum PatientIdentityFilters {
    Id,
    Name,
    PatientId
}

export enum PatientKinFilters {
    Id,
    Name,
    PatientId,
    IpForm
}
export enum PatientAttachmentFilters {
    Id,
    Name,
    PatientId,
    ObjectTypeId,
    AttachmentTypeId
}
export enum PatientGuarantorFilters {
    Id,
    ActiveStatusId,
    PatientId,
    Guarantor,
    GuarantorTypeId,
    GuarantorId,
    Rank,
    EncounterId
}
export enum PatientGuarantorGLFilters {
    Id,
    PatientGuarantorId,
    PatientId
}
export enum EncounterGuarantorFilters {
    Id,//0
    ActiveStatusId,//1
    EncounterId,//2
    Guarantor,//3
    GuarantorTypeId,//4
    Rank, //5
    PatientId,  //6
    GuarantorId   //7
}
export enum EncounterGuarantorGLFilters {
    Id,
    EncounterGuarantorId,
    PatientId
}
export enum FamilyLinkFilters {
    Id,
    Name,
    PatientId,
    IncludeEncounter
}
export enum PatientFollowupFilters {
    Id,
    PatientName,
    DoctorId,
    DepartmentId,
    UnitId,
    MobileNo,
    AdmitDate,
    FollowupTypeId,
    FollowupStatusId,
    EncounterId
}
export enum PatientArchiveFilters {
    Id, //0
    Name, //1
    MRN, //2
    DOB, //3
    PhoneNumber, //4
    VisitID, //5
    RegisteredDate, //6
    PatientStatus, //7
    IncludeAppointments, //8
    From, //9
    To, //10
    ReferrerId, //11
    VisitDate, //12
    VisitType, //13
    GuarantorId, //14
    IsAdmitted, //15
    Pincode, //16
    CountryName, //17
    StateName, //18
    CityTownName, //19
    Area, //20
    AppointmentStatus, //21
    ConsultationStatus, //22
    ShowTempPatient, //23
    IsVistInProgress, //24
    IsBillOutStanding, //25
    NRIC,   //26
    visiteddate,  //27
    EncFacilityId, // 28
    PatFacilityId, // 29
    GuardianName,//30
    VisitTypeId, //31
    MRNShortCode, //32
}
export enum QMSFilters {
    Id, //0
    FacilityId, //1
    QMSReasonId, //2
    PatientId, //3
    MRN, //4
    FirstName, //5
    Mobile, //6
    Email, //7
    RegisteredDate, //8
    NameAndMrnSearch, //9
    TokenNo, //10
    IsPatientCreated, //11
    QMSStatusId //12
}
export enum PatientDeathFilters {
    Id,
    PatientId,
    FacilityId,
    EncounterId,
    DeathStatusId,
    From,
    To
}
export enum LocalWellCustomerOrderFilters {
    Id,
    CustomerId,
    PatientId,
    CustomerOrderId,
    From,
    To
}
