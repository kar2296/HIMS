export enum VirtualCategoryFilters {
    Id,
    Code,
    Name,
    Status,
    FacilityId,
    IsLabCategory
}
export enum VirtualSubCategoryFilters {
    Id,
    CategoryId,
    Code,
    Name,
    Status,
    FacilityId,
    IsLabCategory,
    IsHome//7
}
export enum VirtualOrderFilters {
    Id,
    VirtualOrderStatusId,
    OrderReqDate,
    From,
    To,
    PatOrderBill,
    VirtualCategoryId,
    VirtualSubCategoryId,
    PatientId,
    OrderSchDate,
    FromSch,
    ToSch,
    DoctorId,
    FacilityId
}
export enum VirtualOrderDetailFilters {
    Id,
    VirtualOrderId,
}
export enum VirtualBillFilters {
    Id,
    VirtualBillStatusId,
    VirtualOrderId,
    PatientId,
    BillDateTime,
    From,
    To,
    IsPaidFully
}
export enum VirtualBillDetailFilters {
    Id,
    VirtualBillId,
}
export enum VirtualConferenceFilters {
    Id, //0
    PatientId, //1
    ConferenceSchDate, //2
    From, //3
    To, //4
    OrderId, //5
    VirtualOrderStatusId //6
}
export enum VirtualConferenceSessionFilters {
    Id,
}
export enum VirtualConferenceParticipantFilters {
    Id,
    ConferenceId,
    ParticipantUserId
}
export enum VirtualConferenceSessionUserFilters {
    Id,
}
export enum VirtualPaymentFilters {
    Id,
    PaymentStatusId,
    VirtualOrderId,
    PatientId,
    BillDateTime,
    From,
    To,
    IsPaidFully
}
export enum BannerContentFilters {
    Id,
    FacilityId,
    CategoryId
}
export enum SuccessStoryFilters {
    Id,
    FacilityId,
    CategoryId,
    ActiveStatusId,
    CreatedId
}
export enum VirtualMedicineOrderFilters {
    Id,
    VirtualMedicineOrderStatusId,
    PatientId,
    DoctorId,
    FacilityId,
    MedicineOrderNo,
    MedicineOrderDate,
    From,
    To
}
export enum VirtualMedicineOrderDetailFilters {
    Id,
    MedicineOrderId,
}
