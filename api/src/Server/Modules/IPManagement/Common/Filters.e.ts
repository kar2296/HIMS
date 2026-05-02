export enum AdmissionRequestFilters {
    FacilityId,
    WardId,
    AdmissionRequestStatusId,
    Id,
    RemarkId,
    LocationId,
    AdmittingReasonId,
    PriorityId,
    AdmissionRequestTypeId,
    DiagnosisId,
    DoctorId,
    PatientId,
    PatientNameMRN,
    RequestNo,
    FromDate,
    ToDate,
    RequestFromDate,
    RequestToDate
}
export enum BedHousekeepingFilters {
    Id,
    WardId,
    HouseKeepingStatusId,
    PatientNameMRN,
    RequestTypeId,
    RequestIdentifier,
    HousekeepingActivityId,
    CreatedAt,
    RoomId,
    LocationId,
    BedId,
    AssignedId,
    PatientId,
    EncounterId,
    From,
    To
}
export enum BedTransportationFilters {
    Id, //0
    TransportStatusId,//1
    PatientNameMRN,
    RequestTypeId,
    TransportIdentifier,
    TransportActivityId,
    CreatedAt,
    FromLocationId,
    ToLocationId,
    FromWardId,
    ToWardId,
    FromRoomId,
    ToRoomId,
    FromBedId,
    ToBedId,
    AssignedId

}
export enum PatientStockRequestsFilters {
    Id,
    PatientRequestId,
    PatientRequestNumber,
    PatientRequestDate,
    PatientRequestStatus,
    PatientId,
    WardId,
    RoomId,
    Facility,
    ToStoreId,
    PatientRequestPriorityId,
    Patientname,
    RequestedBy,
    ApprovedBy,
    From,
    To,
    EncounterId,
    PatientStockRequestId,
    PatientRequestTypeId,
    Guarantor,
    BedId,
    PatientRequestStatusId,
    PatientRequestDateTime,
    IsCash,
    FromCreatedAt,
    ToCreatedAt,
    GuarantorTypeId
}
export enum PatientStockRequestDetailsFilters {
    Id,
    PatientStockRequestId,
    ItemId,
    ItemName,
    QuantityOnHand,
    NetAmount,
    ToStoreId,
    ItemMasterId,
    PatientRequestDateTime,
    From,
    To,
    PatientRequestStatusId,
    Facility,
    WardId
}
export enum BedTransferFilters {
    Id,//0
    PatientNameMRN,//1
    FromWardId,//2
    RequestedStatusId,//3
    RequestDate,//4
    From,//5
    To,//6
    DepartmentId,//7
    DoctorId,//8
    FromRoomId,//9
    FromBedId,//10
    RequestIdentifier,//11
    AdmissionStatusId,//12
    ToBedId,//13
    ToRoomId,//14
    ToWardId,//15
    FromFacilityId, //16
    TransferDate,
    RequestedStatus,
    IsOtTransfer,
    ReceivedStatusId
}
export enum BedOccupancyHistoryFilters {
    Id,//0
    EncounterId,//1
    OccupancyStatus,//2
    BedId,//3
    PatientId,//4
    IsPrimaryBed,//5
    AdmissionStatusId,
    DoctorId,
    WardId,
    FacilityId,
    GuarantorId
}
export enum BedtransportationlogFilters {
    Id
}
export enum BedHousekeepinglogFilters {
    Id
}
export enum PatientAdmissionLogFilters {
    Id,
    EncounterId
}
export enum PatientAdmissionRequestLogFilters {
    Id
}
export enum PatientDischargeEventFilters {
    Id,
    EncounterId
}
export enum BedReservationDetailFilters {
    Id,
    BedId,
    ReserveMaintenanceType,
    BedReservationType,
    BedMaintenanceType
}
export enum FileRequestFilters {
    Id, //0
    RequestIdentifier,  //1
    FromDepartmentId,  //2
    ToDepartmentId,  //3
    DoctorId,  //4
    PatientNameMRN, //5
    RequestDate,  //6
    From,  //7
    To,   //8
    PatientId,  //9
    MRDFileStatusId,   //10
    MRDTypeId,  //11
    MRDMovementStatusId, //12
    EncounterId //13
}
export enum MRDLocationFilters {
    Id,
    BarcodeId,
    TransactionDate,
    FacilityId,
    DepartmentId,
    PatientId,
    PatientMrn,
    EncounterId,
    DoctorId,
    RackId,
    LocationId,
    MRDFileStatusId,
    From,
    To,
    MRDMovementStatusId,
    MovementStatus
}
export enum FileIssueFilters {
    Id,
    RequestIdentifier,
    FromDepartmentId,
    MRDLocationId,
    DoctorId,
    PatientNameMRN,
    RequestDate,
    From,
    To,
    PatientId,
    MRDFileStatusId,
    MRDTypeId
}
export enum PatientStockReturnsFilters {
    Id,
    PatientReturnId,
    PatientReturnNumber,
    PatientReturnDate,
    PatientReturnStatus,
    PatientId,
    WardId,
    RoomId,
    Facility,
    ToStoreId,
    PatientReturnPriorityId,
    Patientname,
    RequestedBy,
    ApprovedBy,
    From,
    To,
    EncounterId,
    PatientReturnDateTime
}
export enum PatientStockReturnDetailsFilters {
    Id,
    PatientStockReturnId,
    ItemId,
    ItemName,
    QuantityOnHand,
    NetAmount,
    ToStoreId,
    ItemMasterId,
    EncounterId,
    ReturnStatus
}
export enum MRDMovementFilters {
    Id,
    BarcodeId,
    TransactionDate,
    FacilityId,
    PatientId,
    PatientMrn,
    EncounterId,
    DoctorId,
    From,
    To,
    MRDMovementStatusId
}
export enum MRDFileAttachmentFilters {
    Id,
    PatientId,
    MRN,
    EncounterId,
    EncounterTypeId,
    AdmissionDate,
    MRDFileTypeId,
    VisitIdentifier,
    CapturedDate,
    From,
    To
}
export enum MRDFilesFilters {
    Id,
    PatientName,
    VisitNo,
    DischargeDate,
    From,
    To,
    MRDIPFileStatusId,
    DoctorId,
    ReturnDate,
    ReturnFrom,
    ReturnTo
}
export enum IPFileRequestFilters {
    Id,
    PatientName,
    VisitNo,
    DischargeDate,
    From,
    To,
    MRDIPFileStatusId,
    DoctorId,
    RequestDate,
    RequestFrom,
    RequestTo
}
export enum PatientSickLeaveFormFilters {
    Id,
    PatientId,
    EncounterId,
    FormTypeId
}
export enum IPClearenceFilters {
    Id,
    PatientName,
    DepartmentId,
    IPClearenceDate,
    From,
    To,
    IPClearenceStatusId,
    PatientId,
    EncounterId
}
