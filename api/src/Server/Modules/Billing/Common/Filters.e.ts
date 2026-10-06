export enum PatientBillsFilters {
    Id, //0
    PatBillDt, //1
    PatBillNr, //2
    PatId, //3
    PatientBillStatus, //4
    BillPriority,//5
    BillType,//6
    Doctor,//7
    Facility,//8
    GuarantorType,//9
    Guarantor,//10
    IsOutStanding,//11
    OnlyPID,//12
    MRN,//13
    Mobile,//14
    PatientName,//15
    EncounterId,//16
    FromDate,//17
    ToDate,//18
    EncounterTypeId,//19
    BillTypeIdInQ,//20
    IsPharmacyBill,//21
    PharmacySaleTypeId,//22
    IsDoctorShare,//23
    PharmacySaleType,//24
    IsDoctorDisplay,//25
    IsClaimed,//26
    MultiGuarantorType,//27
    ChecklistStatusId,//28
    StoreMasterId,//29
    PrivateDueId,//30
    ExcludeEncounterType,//31
    IsConsolidatePay,//32
    BillingType,//33
    ScheduleTypeId,//34
    From,//35
    To,//36
    AdmissionDate,//37
    OTRegisterId,//38
    CreatedBy, //39
    IsRegCumBill, //40
    PaymentTypeId, // 41
    IsModified, // 42
    ReferralId,  //43
    IsBillDiscount, //44
    IsOutStandingDesc, // 45
    NotOutStanding, // 46
    IsDirectDGBill, //47
    VisitIdentifier, //48
    PatNumBil, //49
    IsPaidFully, //50
    BillDiscount, //51
    IsFromWard, //52
    DepartmentId,//53
    SurgeryentryId,//54
    DiscountApprovedBy,//55
    Staff,//56
    Name,//57
    WardId,
    StaffId,
    UpdatedBy,
    BillGuarantorId,
    IsFromOT,
    GreatrOutStanding,
    IsClinicalBills,
    AppointmentId,
    NotinReferralId,
    IsOpticalBill,//67
    RecFromDate,
    RecToDate,
    PatientId,
    IsTaxable,//71
    IsGuarantorRequired,
    IncludeOrders,
    PatientTypeId,
    DiscountApprovalStatus,
    DiscountApprovalDate,
    BillAmount,
    TransferEncounterId,
    BedId,
    RoomId,
    BillDateTime,
    CreditApprovalStatus
}
export enum PatientBillDetailsFilters {
    Id,
    Name,
    PatientBillId,
    EncounterId,
    PatientBillStatus,
    ServiceCategoryId,//5
    FromDate,
    ToDate,
    ServiceName,
    IsSupplementary,
    GuarantorId,//10
    BillNumber,
    IsTempIPBill,
    IsInvoicedDoctorShare,
    StoreMasterId,
    IsPharmacySale,//15
    DoctorId,
    EncounterTypeId,
    DoctorShareAmount,
    VisitIdentifier,
    PatientNameMrn,//20
    PharmacySaleTypeId,
    PharmacyServiceCategoryId,
    ServiceGroupId,
    IsPharmacyCredit,
    OTRegisterId,//25
    OnlyOTItems,
    PatientId,
    ServiceId,
    IsExclusionItem,
    IsInclusionItem,//30
    NotInPatientBillStatusIds,
    BillTypeId,
    FacilityId,
    IsExecutingService,
    ScheduleTypeId,//35
    IsPharmacyBill,
    NonServiceCategoryId,
    IsPharmaCollections,
    BillDateTime,
    BothSupplmandPartial,//40
    MultiScheduleTypeId,
    ProductTypeId,
    IsDietBill,
    IsPharmacyReturn,
    NetAmount,
    BillStatus,
    Quantity,
    CancelReqRaisedStatusId,
    DepartmentId,
    InvoiceDoctorStatusId,
    AdmissionStatusId,
    RecFromDate,//52
    RecToDate,
    parentRecFromDate,//54
    parentRecToDate,
    IsPaidBills,
    MultiSaleType,
    IsAutoBillModified,
    PatientBillStatusId,
    NotInServiceCategoryId
}
export enum PatientPaymentDetailsFilters {
    Id,
    ReceiptNumber,
    OnlyPID,
    ReceiptDatetime,
    ReceiptType,
    ReceiptStatus,
    FirstName,
    LastName,
    PatientNameMRN,
    PatientBillId,
    EncounterId,//10
    EncounterTypeId,
    BillTypeId,
    IsPharmacyReceipt,
    PharmacyReceiptTypeId,
    StatusOfReceipts,
    IsConsolidatePay,
    IsClaimed,
    EncounterNotIn,
    CreatedBy,
    CanIncludeBill,
    PaymentStatus,
    BillNum,
    PaymentTypeId, // 23
    AdjustmentReceiptId, //24
    IsAdjustmentReceipt, //25
    FacilityId, //26
    From, //27
    To, //28
    NeqReceiptStatus, //29
    ReceiptTypes, //30
    StoreMasterId,
    DepartmentID,
    BillType,
    NeqPaymentTypeId,
    AmountPaid,
    IsPharmacyClearance,
    ReceiptTypeId,
    IsClaimReceipt,
    MultiUser
}
export enum PatientRefundFilters {
    Id,
    RefundIdentifier,
    PatientNameMRN,
    RefundDateTime,
    RefundType,
    RefundStatus,
    FirstName,
    LastName,
    PatientBillId,
    PatientReceiptId,
    EncounterId,
    EncounterTypeId,
    fromDate,
    toDate,
    CreatedBy,
    StoreMasterId,
    FacilityId,
    RefundGeneratedById,
    CreatedById,
    IsCashToCredit,
    PaymentTypeId,
    UpdatedBy,
    PatientId,
    IsPharmacyBill,
    ReceiptTypeId,
    RefundTypes,
    RefundApprovalStatus
}
export enum PatientBillSplitDetailsFilters {
    Id,
    EncounterId,
    PatientBillId,
    PatientBillSummaryId,
    IsSupplementary
}
export enum PatientCreditNoteFilters {
    Id,
    CreditNoteDateTime,
    PatientName,
    CreditNoteType,
    CreditNoteIdentifier,
    CreditNoteStatus,
    PatientId,
    Guarantor,
    GuarantorType,
    CreditNoteAmount,
    Doctor,
    From,
    To
}
export enum PatientCreditNoteDetailsFilters {
    Id,
    Name,
    PatientCreditNoteId,
    CreditNoteType
}
export enum PatientBillSummaryFilters {
    Id,
    EncounterId,
    IsPharmacySale,
    ServiceCategoryId,
    ActualAmount,
    NotInServiceCategoryId
}
export enum PatientBillLockFilters {
    Id,
    EncounterId,
    PatientId,
    LockStatusId
}
export enum PatientReturnsFilters {
    Id,
    PatReturnDt,
    PatReturnNr,
    PatId,
    PatientReturnStatus,
    ReturnPriority,
    ReturnType,
    Doctor,
    Facility,
    GuarantorType,
    Guarantor,
    IsOutStanding,
    OnlyPID,
    MRN,
    Mobile,
    PatientName,
    EncounterId,
    ReturnTypeId,
    MultiReturnType,
    PharmacyReturnType,
    StoreMasterId,
    IsRefundedFully,
    CreatedBy,
    TypeOfReturn,
    FromDate,
    ToDate,
    PatientBillId,
    EncounterTypeId,
    PatNameMrn,
    WardId,
    VisitIdentifier
}
export enum PatientReturnDetailsFilters {
    Id,
    Name,
    PatientReturnId,
    EncounterId,
    PatientReturnStatus,
    ServiceCategoryId,
    FromDate,
    ToDate,
    ServiceName,
    PatientBillId
}
export enum InsurancePaymentFilters {
    Id,
    PaymentIdentifier,
    FacilityId,
    InsurancePaymentStatusId,
    GuarantorTypeId,
    GuarantorId,
    PaymentDate,
    FromDate,
    ToDate

}
export enum InsurancePaymentDetailsFilters {
    Id,
    InsurancePaymentId,
    FacilityId,
    PaymentDate,
    FromDate,
    ToDate,
    InsurancePaymentStatusId,
    GuarantorTypeId,
    GuarantorId,
    TDSAmount,
    Disallowed,
    PatientBillId//11
}
export enum PatientDispenseFilters {
    Id,
    DispenseNumber,
    DispenseTypeId,
    DispenseStatusId,
    DispenseDate,
    FacilityId,
    StoreMasterId,
    ToStoreMasterId,
    PatientRequestNumber,
    PatientName,
    WardId,
    From,
    To,
    RequestedBy,
    ApprovedBy,
    DispensedBy,
    DispenseStatus,
    PatientId,
    PatientMRN,
    OTIdentifier,
    EncounterId,
    OTRegisterId,
    ItemMasterId,
    PatientStockRequestId
}
export enum PatientDispenseDetailFilters {
    Id,
    PatientDispenseId,
    ItemMasterId,
    DispenseDateTime,
    From,
    To,
    FacilityId,
    StoreMasterId,
    WardId
}
export enum PatientDispenseReturnFilters {
    Id,
    DispenseReturnNumber,
    DispenseReturnStatusId,
    ReturnReceivedDateTime,
    FacilityId,
    StoreMasterId,
    ToStoreMasterId,
    PatientReturnNumber,
    PatientName,
    From,
    To,
    DispenseReturnDateTime,
    PatientStockReturnId
}
export enum PatientDispenseReturnDetailFilters {
    Id,
    PatientDispenseReturnId,
    ItemMasterId
}
export enum ClaimSubmissionFilters {
    Id,
    ClaimNumber,
    Guarantor,
    FromDate,
    ToDate,
    ClaimSubmissionStatus,
    ClaimSubmissionId,
    PatientId,
    EncounterId,
    GuarantorId,
    FacilityId,
    ClaimAmount
}
export enum ClaimSubmissionDetailsFilters {
    Id,
    ClaimSubmissionId
}
export enum PatientInsuranceChecklistFilters {
    Id,
    patientBillId
}
export enum PatientAccountsFilters {
    Id,
    FromDate,
    ToDate,
    TransactionDate,
    TransactionNumber,
    PatientId,
    EncounterId,
    PatientReceiptId,
    FacilityId,
    PatientName
}
export enum PatientPaymentAdjustmentsFilters {
    Id,
    PaymentAdjustNumber,
    OnlyPID,
    AdjustedDateTime,
    FirstName,
    LastName,
    PatientNameMRN,
    PatientBillId,
    EncounterId,
    EncounterTypeId,
    BillTypeId,
    From,
    To,
    FacilityId
}
export enum CustomerBillsFilters {
    Id,
    BillDateTime,
    BillNumber,
    PatId,
    BillStatus,
    BillPriority,
    BillType,
    Facility,
    IsOutStanding,
    Mobile,
    CustomerName,
    CustomerId,
    FromDate,
    ToDate,
    CustomerTypeId,
    StoreMasterId,
    ScheduleTypeId,
    From,
    To,
    CustomerMasterId
}
export enum CustomerBillDetailsFilters {
    Id,
    CustomerBillId,
    CustomerId,
    BillStatus,
    FromDate,
    ToDate,
    ItemMasterId,
    ItemName,
    ItemCode,
    StoreMasterId
}
export enum UserBillingCountersFilters {
    Id,
    UserId,
    BillingCounterId,
    DepartmentId,
    StoreMasterId,
    FacilityId,
    DocumentNumber,
    DocumentDate,
    OpeningDate,
    ClosingDate,
    BillingCounterStatusId,
    StartDate,
    EndDate,
    FromOpen,
    ToOpen,
    FromClosed,
    ToClosed,
    From,
    To
}
export enum UserBillingCounterDenominationsFilters {
    Id,
    UserBillingCounterId
}
export enum UserBillingCounterCancellationsFilters {
    Id,
    UserBillingCounterId
}
export enum PatientBillPackageSummaryFilters {
    Id,//0
    EncounterId,//1
    IPPackageId,//2
    EncounterIPPackageId,//3
    ServiceCategoryId,
    EncounterIPPackagees
}
export enum GeneralExpensesFilters {
    Id,//0
    VoucherNo,//1
    ExpenseDate,//2
    UserId,//3
    ExpenseStatusId,//4
    From,//5
    To,//6
    FacilityId, //7
    ToDate, //8
    ExpenseTypeId,
    PaymentTypeId

}
export enum PatientExecutableProcedureFilters {
    Id,//0
    FacilityId,//1
    PatientBillId,
    BillNumber,
    PatientBillDetailId,
    EncounterId,
    DoctorId,
    PatientId,
    ServiceId,
    ServiceName,
    ServiceCategoryId,
    DepartmentId,
    PatientBillStatusId,
    ExecutableProcedureStatusId,
    FromDate,
    ToDate,
    BillDateTime,
    BillsRaisedFromId,
    OrderRequestFromDate,
    OrderRequestToDate,
    OrderRequestDate
}
export enum BankStatementsFilters {
    Id,
    UserId,
    BillingCounterId,
    DepartmentId,
    StoreMasterId,
    FacilityId,
    DocumentNumber,
    DocumentDate,
    OpeningDate,
    ClosingDate,
    BillingCounterStatusId,
    StartDate,
    EndDate,
    FromOpen,
    ToOpen,
    FromClosed,
    ToClosed,
    From,
    To,
    CreatedBy
}
export enum BankStatementDetailsFilters {
    Id,
    BankStatementId
}
export enum BankStatementDenominationsFilters {
    Id,
    BankStatementId
}
export enum BankStatementCancellationsFilters {
    Id,
    BankStatementId
}
export enum LHRCVoucherFilters {
    Id,
    LHRCVoucherNo,
    VoucherDate,
    From,
    To,
    CreatedBy,
    VoucherStatusId,
    FacilityId,
    PaymentTypeId,
}
export enum LHRCVoucherDetailFilters {
    Id,
    LHRCVoucherId
}
export enum DoctorShareFilters {
    Id,//0
    FacilityId,//1
    DoctorClassId, //2
    ShareTypeId,//3
    EncounterTypeId,//4
    ActiveFrom, //5
    ActiveTo, //6
    ActiveStatusId, //7
}
export enum DoctorShareDetailsFilters {
    Id,//0
    DoctorShareId,//1
    FacilityId,//2
    SharingTypeId,//3
    ServiceCategoryId,//4
    ServiceId,//5
    EncounterTypeId,//6
    ShareTypeId, //7
    ActiveFrom, //8
    ActiveTo, //9
    ActiveStatusId, //10
}
export enum StaffCreditPaymentFilters {
    Id,//0
    StaffCreditPaymentIdentifier,//1
    StaffCreditPaymentDate,//2
    FromDate,//3
    ToDate,//4
    StaffCreditPaymentStatusId,//5
    MRN,//6
}
export enum StaffCreditPaymentDetailsFilters {
    Id,//0
    StaffCreditPaymentId,//1
}
export enum GstReportFilters {
    RunDate,
    FROMDATE,
    TODATE,
    STORES
}
export enum PromotionalSchemeFilters {
    Id,
    GuarantorId,
    ActiveStatusId,
    PromotionSchemeTypeId,
    From,
    To
}
export enum PromotionalSchemeDetailFilters {
    Id,
    PromotionalSchemeId
}
export enum PrivilegeCardFilters {
    Id,
    CardTypeId,
    ValidTo,
    From,
    To,
    CreatedFrom,
    CreatedTo,
    CardNo
}
export enum PrivilegeCardDetailFilters {
    Id,
    PrivilegeCardId
}
export enum PatientDoctorShareDetailsFilters {
    Id,
    FromDate,//1
    ToDate,
    BillDateTime,//3
    DoctorId,
    EncounterType,//5
    ServiceCategoryId,
    NotinServiceCategoryId,//7
    AdmissionStatusId,
    EncounterId,//9
    PatientBillId,
    PatientBillDetailId,
    DoctorShareStatusId,//12
    ServiceItemId,
    PatientBillStatusId,
    FacilityId,
    BillNumber,
    DoctorShareStatusIPId,
    IsFinalBill,//18
    FromCreDate,
    ToCreDate,
    BillTypeId,
    ParentBillNumber,
    MRN
}
export enum CollectionBaseRevenueFilters {
    Id,
    FromDate,
    ToDate,
    PatientBillStatus,
    EncounterTypeId,
    DoctorId,
    FacilityId,
    DepartmentId
}
export enum BillingRequestFilters {
    Id,
    FromDate,
    ToDate,
    PatientBillStatus,
    EncounterTypeId,
    DoctorId,
    FacilityId,
    DepartmentId,
    BillingRequestTypeId,//8
    BillingRequestStatusId,
    PatientBillId,
    FirstName,
    LastName,
    PatientNameMRN,
    BillNumber,
    BillTypeId,
    NotinEncounterTypeId,//16
    TypeId,
    BillRequestFrom,
    BillRequestTo,
    IsDetailBill,
    EncounterId
}
export enum DoctorShareTdsFilters {
    Id,//0
    FacilityId,//1
    PatientBillDetailId, //2
    BillDateTime,//3
    From,//4
    To,//5
    BillDoctorId, //6
    ShareDoctorId //7
}
export enum ClaimCoveringletterFilters {
    Id,
    ClaimNumber,
    Guarantor,
    FromDate,
    ToDate,
    ClaimCoveringletterStatus,
    PatientId,
    EncounterId,
    ClaimSubmissionId,
    ClaimSubmissionDetailId
}
export enum ClaimCoveringletterDetailsFilters {
    Id,
    ClaimCoveringletterId,
    GuarantorId,
    PatientId,
    EncounterId,
    IsClaimCoveringLetter,
    ClaimSubmissionId
}

export enum CollectionReportFilters {
    Id,
    FacilityId,
    FromDate,
    ToDate,
    CollectionStatusId,
    IsUpdated
}

export enum CategoryRevenueFilters {
    Id,
    RevenueDate,
    FromDate,
    ToDate,
    FacilityId,
    RevType
}
export enum RevenueFilters {
    Id,
    FacilityId,
    RevenueDate,
    FromDate,
    ToDate
}
export enum OPStatisticsFilters {
    Id,
    VisitDate,
    FromDate,
    ToDate,
    FacilityId
}
export enum PosLogFilters {
    Id,
    MID,
    TID,
    billNumber,
    TranId,
    TxnStatus,
    FacilityId
}
export enum DynamicQRLogFilters {
    Id,
    MerchantId,
    TerminalId,
    MerchantTranId,
    TxnStatus
}
export enum PosMomentLogFilters {
    Id,
    ResponseCode,
    ProcessingId,
    CustomerId,
    TransactionId
}

