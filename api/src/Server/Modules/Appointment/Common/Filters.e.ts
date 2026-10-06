export enum AppointmentCategoryFilters {
    Id,
    Name,
    Facility,
    AppointmentCategoryType,
    ActiveStatus
}

export enum AppointmentSessionFilters {
    Id,
    Name,
    Facility,
    AppointmentSessionType,
    AppointmentDate,
    Doctor,
    Resource,
    SpecialityId,
    ActiveStatusId
}

export enum AppointmentMultiSessionFilters {
    Id,
    Name,
    Facility,
    AppointmentSessionType,
    AppointmentDate,
    Doctor,
    Resource,
    SpecialityId,
    ActiveStatusId,
    DoctorId,
    OrderTypeId,
    onlyOrderTypeId,
    withoutOrderTypeId
}


export enum AppointmentFilters {
    Id,
    Name,
    Facility,//2
    Department,
    AppointmentType,
    Doctor,//5
    Resource,
    AppointmentStatus,
    AppointmentDate,//8
    From,
    To,
    AppointmentCategory,//11
    VisitType,
    Priority,
    Referral,
    PatientId,//15
    MRN,
    Mobile,
    IsMrdFileRequest,//18
    MRNTypeId,
    DoctorId,
    AllFacility,//21
    IsVirtualAppointments,
    SubCategoryId,
    IsPaid,
    PaymentModeId,
    OrderConsultTypeId,
    graeaterDoc,
    IsRescheduled,
    caldoctor,
    calappointmeentstatus
}

export enum PatientTrackerFilters {
    Id,
    Name,
    PatientId,
    ConsultationId,
    EncounterId,
    FollowupAppointmentOn,//5
    IsDischargeMedication,
    TrackerStatusId,//7
    From,
    To,
    FollowupTrackerStatusId,
    DepartmentId//11
}
export enum DoctorDisplayFilters {
    Id,
    Department,
    Location,
    DoctorName,
    DisplayStatus,
    DisplayNo,
    Docname,
    Deptname
}
export enum GeneraldisplayFilters {
    Id,
    Displaydate,
    LOCATIONId,
    DisplayNo,
    GeneralDisplayStatus
}
export enum TokenDisplayFilters {
    Id,
    Department,
    TokenStatus,
    PatientOrderId
}
export enum AppointmentDisplayFilters {
    Id,
    DisplayNo,
    TokenStatus,
    AppointmentId,
    LocationId,
    PatientId,
    FacilityId
}
export enum AppointmentRequestFilters {
    Id,
    PatientId,
    DoctorId,
    AppointmentDate,
    AppointmentRequestStatus,
    Pending,
    Cancelled
}
