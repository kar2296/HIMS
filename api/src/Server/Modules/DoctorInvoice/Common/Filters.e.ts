export enum DoctorInvoiceFilters {
    Id,//0
    FacilityId,//1
    DoctorId,//2
    InvoiceIdentifier,//3
    GeneratedBy,//4
    InvoiceDate,//5
    InvoiceStatusId,//6
    IsFullyPaid,//7
    EncounterId,//8
    From,//9
    To,//10
    TDSAmount,
    TDSId
}
export enum DoctorInvoiceDetailsFilters {
    Id,//0
    FacilityId,//1
    DoctorInvoiceId,//2
    DoctorId,//3
    PatientBillId,
    EncounterId
}
export enum DoctorPaymentFilters {
    Id,//0
    FacilityId,//1
    DoctorId,//2
    PaymentIdentifier,//3
    GeneratedBy,//4
    PaymentDate,//5
    PaymentStatusId,//6
    From,
    To,
    PaymentTypeId,
    CreatedBy,
    UpdatedBy
}
export enum DoctorPaymentDetailsFilters {
    Id,//0
    DoctorPaymentId,//1
    FacilityId,//2
    DoctorInvoiceId,//3

}
