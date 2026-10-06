export enum FamilyConditionFilters {
    Id,
    Name,
    PatientId,
    ConditionType,
    Relationship,
    ConditionStatusId,
    EncounterId,
    ConsultationId
}

export enum FamilySocialHistoryFilters {
    Id,
    Name,
    PatientId,
    SocialTypeId,
    SocialHistoryStatusId,
    EncounterId,
    ConsultationId
}

export enum PatientAllergyFilters {
    Id, //0
    Name, //1
    PatientId, //2
    AllergyType, //3
    PatientAllergyStatusId, //4
    EncounterId, //5
    ConsultationId //6
}

export enum PatientConditionFilters {
    Id,
    Name,
    PatientId,
    ConditionType,
    ConditionStatusId,
    EncounterId,
    ConsultationId,
    IsPatientCondition,
    ConditionDate,
    From,
    To
}

export enum PatientImmunizationFilters {
    Id,
    Name,
    PatientId,
    ImmunizationType,
    ImmunizationStatus,
    EncounterId,
    ConsultationId
}

export enum PatientMedicationFilters {
    Id,
    Name,
    PatientId,
    DrugId,
    PatientMedicationStatusId,
    EncounterId,
    ConsultationId
}

export enum PatientProcedureFilters {
    Id,
    Name,
    PatientId,
    Procedure,
    ProcedureType,
    PatientProcedureStatus,
    EncounterId,
    ConsultationId
}

export enum PatientSocialHistoryFilters {
    Id,
    Name,
    PatientId,
    SocialTypeId,
    SocialHistoryStatusId,
    EncounterId,
    ConsultationId
}

export enum PatientVitalFilters {
    Id, //0
    Name, //1
    PatientId, //2
    VitalId, //3
    PatientVitalStatusId, //4
    From, //5
    To, //6
    PerformedBy, //7
    EncounterTypeId, //8
    EncounterId, //9
    ConsultationId, //10
    GroupId,  //11
    FromAdm, //12
    ToPerformedDate //13
}

export enum PrescriptionFilters {
    Id, //0
    Name, //1
    PatientId, //2
    DoctorId, //3
    DepartmentId, //4
    PharmacyId, //5
    PrecriptionStatusId, //6
    PrescriptionDate, //7
    From, //8
    To, //9
    EncounterTypeId, //10
    DispenseStatusId, //11
    EncounterId, //12
    ConsultationId, //13
    Patient, //14
    PrescriptionPriorityId, //15
    IsDischargeMedication, //16
    FacilityId, //17
    ReviewDate, //18
    IseMAR,//19
    IsCash//20
}

export enum PrescriptionDetailFilters {
    Id,
    Name,
    PrescriptionId,
    PatientId,
    EncounterId,
    PrecriptionStatusId,
    ConsultationId,
    From,
    To,
    DoctorId
}

export enum PatientSurgicalFilters {
    Id,
    Name,
    PatientId,
    Procedure,
    ProcedureType,
    PatientSurgicalStatusId,
    EncounterId,
    ConsultationId
}

export enum PatientOrderFilters {
    Id,   //0
    Name,  //1
    PatientId,  //2
    OrderPriority,  //3
    OrderStatus,    //4
    BillingId,  //5
    OrderNumber,  //6
    OrderReqDate,   //7
    Patient,   //8
    TestType,  //9
    DoctorId,  //10
    OrderFromId, //11
    From,  //12
    To,  //13
    OrderToId, //14
    TestTypeId,   //15
    EncounterType, //16
    WardId,  //17
    EncounterId, //18
    BillingStatusId, //19
    EncounterTypeId,  //20
    ConsultationId, //21
    IncludeWOStatus, //22
    TestName, //23
    BillNumber,//24
    GuarantorTypeId,//25
    GuarantorId,//26
    FacilityId, //27
    SubDeptId, // 28
    IsDirectBill, // 29
    VisitIdentifier, //30
    PatOrderBill, //31
    BillOrderNumber,//32
    IsVirtualOrders,//33
    IsLabOrders,//34
    IsPaidFully, //35
    OrderScheduleDate,//36
    FromSch,//37
    ToSch,//38
    OrderRequestDate,//39
    FromReqDate,//40
    ToReqDate,//41
    PatBillingId,
    IsExternalLab,
    GreaterBillingId,
    VisitTypeId,
    NoEncounterId,//46
    OrderType
}

export enum PatientOrderDetailFilters {
    Id,  //0
    Name, //1
    PatientOrderId, //2
    Ids, //3
    IncludeServiceItem, //4
    IncludeTestMaster, //5
    IsPackage, //6
    IsDashBoard,  //7
    IsDirectBill, // 8
    PatientBillStatusId, //9
    PatientBillId,
    PatientBillDetailId,
    TestId,
    PatientId,
    OrderStatusId,
    EncounterId,
    ConsultationId,
    RequestDate,
    From,
    To,
    TestType,
    SubDepartmentId,
    EncounterTypeId
}

export enum ClinicalDocumentFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    ConsultationId,
    CreatedDate,
    From,
    To
}
export enum PatientDiagnosisFilters {
    Id,
    EncounterId,
    ConditionTypeId,
    DiagnosisName,
    ConditionStatusId
}

export enum PatientIntakeOutputFilters {
    Id,
    Name,
    PatientId,
    IntakeOutputTime,
    From,
    To,
    CapturedBy,
    IntakeOutputTypeId,
    IntakeTypeId,
    OutputTypeId,
    IntakeOutputStatusId,
    EncounterId
}

export enum PatientDietPlanFilters {
    Id,
    PatientId,
    EncounterId,
    ConsultationId
}
export enum PatientDietPlanLogFilters {
    Id,

}
export enum PatientFeedbackFilters {
    Id,
    Name,
    PatientId,
    FeedbackTypeId,
    FeedbackOn,
    From,
    To,
    PatientName,
    PatientFeedbackStatusId
}

export enum PatientFeedbackDetailsFilters {
    Id,
    Name,
    PatientFeedbackId,
    PatientFeedbackStatusId,
    From,
    To,
    FeedbackTypeId
}
export enum PatientDietNbmFilters {
    Id,
    PatientId,
    PatientDietNbmTypeId
}
export enum PatientDietOrderFilters {
    Id,
    Name,
    PatientId,
    OrderPriority,
    OrderStatus,
    Patient,
    WardId,
    FromDate,
    ToDate,
    OrderNumber,
    // DietFrequencyId,
    OrderToId,
    UserId,
    PatientDietOrders,
    DietFrequency,
    EncounterId,
    DietFrequencyId
}
export enum PatientDietOrderDetailFilters {
    Id,
    Name,
    PatientDietOrderId,
    PatientDietOrders,
    Ids,
    IncludeServiceItem,
    IsDirectBill,
    FromDate,
    ToDate
}
export enum NewBornDetailFilters {
    Id,
    PatientId,
    ModeOfDeliveryId,
    NewBornStatusId,
    FromDate,
    ToDate
}
export enum PatientLabourDetailFilters {
    Id,
    PatientId,
    LMPDate,
    LabourStatusId,
    ModeOfDeliveryId,
    From,
    To
}
export enum DailyNoteFilters {
    Id,
    NoteTypeId,
    CapturedBy,
    NoteStatusId,
    CapturedOn,
    From,
    To,
    PatientId,
    EncounterTypeId,
    EncounterId
}
export enum PatientAnnotationFilters {
    Id,
    PatientId,
    EncounterId,
    AnnotationTypeId,
    AnnotationStatusId,
    PerformedBy,
    PerformedDate,
    ConsultationId
}

export enum ConsultationFilters {
    Id,
    Name,
    Encounter,
    Patient,
    EncounterDoctor,
    ProgressNoteStatus,
    CreatedAt,
    From,
    To,
    EncounterTypeId,
    ProfileId, //10
    ProfilemasterTypeId,
    IsIVF,
    NoEncounterId,
    NotCurrentId,//14-ConsultationId
    PatientNameMRN,
    VisitIdentifier
}
export enum PastLabResultFilters {
    Id,
    PatientId
}
export enum PastLabResultDetailFilters {
    Id,
    ClinicalResultId,
    TestId
}

export enum CategorySectionEntryFilters {
    Id, //0
    Name, //1
    SectionId, //2
    ConsultationId, //3
    IPCasesheetId, //4
    OTRegisterId, //5
    IPCasesheetAt, //6
    PhysioRegisterId, //7
    PatientId
}

export enum PatientImmunizationScheduleFilters {
    Id,
    Name,
    PatientId
}
export enum PatientEmarFilters {
    Id
}
export enum PatientEmarDetailsFilters {
    Id
}

export enum PatientChiefComplaintFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    ConsultationId
}
export enum PatientVentilatorChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    VentilatorDate,
    From,
    To,
    FromAdm
}
export enum PatientMonitorChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    MonitorChartDate,
    From,
    To,
    FromAdm
}
export enum PatientABGChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    ABGChartDate,
    From,
    To,
    FromAdm
}
export enum PatientBPChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    BPChartDate,
    From,
    To,
    FromAdm
}
export enum PatientDiabetesChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    DiabetesChartDate,
    From,
    To,
    FromAdm
}
export enum PatientDialysisChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    DialysisChartDate,
    From,
    To,
    FromAdm
}
export enum PatientRheumatologyFilters {
    Id,
    Name,
    ConsultationId,
    PatientId
}
export enum IntakeOutputChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    IntakeOutputChartDate,
    From,
    To,
    FromAdm
}

export enum LensPrescriptionFilters {
    Id,
    PatientId,
    EncounterId,
    LensPrescriptionStatusId,
    LensPrescriptionDate,
    From,
    To,
    DoctorId,
    LensIdentifier,
    FacilityId,
    ConsultationId
}
export enum PreOperativeChecklistFilters {
    Id,
    Name,
    PatientId
}

export enum PreOperativeChecklistDetailsFilters {
    Id,
    Name,
    PreOperativeChecklistId
}

export enum BloodRequestFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    BloodRequestDate,
    From,
    To
}

export enum ShoulderAssessmentFilters {
    Id, //0
    PatientId, //1
    EncounterId, //2
    ConsultationId //3
}

export enum PatientGeneralHistoryFilters {
    Id,
    PatientId,
    EncounterId,
    EncounterTypeId,
    GeneralHistory
}
export enum PatientComplaintsFilters {
    Id,
    PatientId,
    EncounterId,
    EncounterTypeId,
}
export enum PastOcularHistoryFilters {
    Id,
    PatientId,
    EncounterId,
    EncounterTypeId,
}
export enum PatientExaminationSystemFilters {
    Id,
    PatientId,
    EncounterId,
    ConsultationId,
    ExaminationId
}
export enum PatientSurgeryAdviceFilters {
    Id,
    PatientId,
    EncounterId,
    ConsultationId,
    SurgeryGroupingId
}
export enum PatientInjectionAdviceFilters {
    Id,
    PatientId,
    EncounterId,
    ConsultationId,
    InjectionGroupingId
}
export enum PatientLaserAdviceFilters {
    Id,
    PatientId,
    EncounterId,
    ConsultationId,
    LaserGroupingId
}
export enum PatientToothChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    ToothChartDatetime,
    FromAdm,
    ToothChartTypeId
}
export enum PatientDischargeMedicationFilters {
    Id,
    PatientId,
    EncounterId,
    ConsultationId,
    IsSelectedDrug
}
export enum PatientAdviceMedicationFilters {
    Id,
    PatientId,
    EncounterId,
    ConsultationId
}
export enum PatientTransferFilters {
    Id,
    PatientId,
    EncounterId,
    TransferDate,
    ReferralDeptartmentId,
    FacilityId,
    FacilityDeptartmentId,
    TransRefDischargeTypeId,
    From,
    To,
    Reviewed,
}
export enum ProcedureOrderFilters {
    Id,   //0
    Name,  //1
    PatientId,  //2
    OrderPriority,  //3
    OrderStatus,    //4
    BillingId,  //5
    OrderNumber,  //6
    OrderReqDate,   //7
    Patient,   //8
    ServiceCategory,  //9
    DoctorId,  //10
    OrderFromId, //11
    From,  //12
    To,  //13
    OrderToId, //14
    ServiceCategoryId,   //15
    EncounterType, //16
    WardId,  //17
    EncounterId, //18
    BillingStatusId, //19
    EncounterTypeId,  //20
    ConsultationId, //21
    IncludeWOStatus, //22
    TestName, //23
    BillNumber,//24
    GuarantorTypeId,//25
    GuarantorId,//26
    FacilityId, //27
    SubDeptId, // 28
    IsDirectBill, // 29
    OrderApprovalStatusId, //30
    OrderTypeId, //31
    IsSelf, //32
    ClaimProcessId, //33
    ClaimNumber, //34
    IsDiscountRequested //35
}

export enum ProcedureOrderDetailFilters {
    Id,  //0
    Name, //1
    ProcedureOrderId, //2
    Ids, //3
    IncludeServiceItem, //4
    IncludeTestMaster, //5
    IsPackage, //6
    IsDashBoard,  //7
    IsDirectBill, // 8
    OrderDetailApprovalStatus, // 9
    PatientBillStatusId, //10
    PatientBillId, //11
    PatientBillDetailId, //12
    CategoryId, //13
    PatientId, //14
    OrderStatusId, //15
    EncounterId,  //16
    ConsultationId  //17
}
export enum PatientClinicalNotesFilters {
    Id,
    PatientId,
    EncounterId,
    ConsultationId,
    PatientClinicalNotesTypeId,
    CreatedAt,
    From,
    To
}
export enum TreatementModalityFilters {
    Id,
    ModalityName,
    ModalityCode
}
export enum PhysiotheraphyTreatementFilters {
    Id,
    PhysiotherapistName,
    PatientId,
    EncounterId,
    PhysiotheraphyStatusId,
    PhysiotheraphyDate,
    From,
    To,
    TreatementModalityId
}
export enum EmarFilters {
    Id,
    PrescriptionId,
    PrescriptionDetailId,
    PatientId,
    EncounterId,
    StoreMasterId,
    DrugId,
    AdministerStatus,
    CreatedAt,
    Patient
}
export enum PositionBpChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    PositionBPChartDate,
    From,
    To
}
export enum CdChartFilters {
    Id,
    Name,
    PatientId,
    EncounterId,
    CdChartDate,
    From,
    To
}
export enum PrescriptionPadFilters {
    Id,
    PatientId,
    EncounterId
}
export enum RevenueTargetFilters {
    Id,
    FacilityId
}
export enum PatientNotifiableDiseaseFilters {
    Id,
    Name,
    PatientId,
    NotifiableDiseaseType,
    NotifiableDisease,
    EncounterId,
    ConsultationId,
    PerformedDate,
    From,
    To,
    EncounterTypeId
}
export enum TreatmentPlanFilters {
    Id,
    PatientId,
    PlanPriority,
    PlanStatus,
    PatientBillId,
    PlanNumber,
    PlanRequestDate,
    From,
    To,
    Patient,
    DoctorId,
    EncounterId,
    ConsultationId,
    EncounterTypeId,
    BillingStatusId,
    BillNumber
}

export enum TreatmentPlanDetailFilters {
    Id,
    TreatmentPlanId,
    ServiceItemId,
    PatientBillStatusId,
    PatientBillId,
    PatientBillDetailId,
    CategoryId,
    PatientId,
    PlanDetailStatusId,
    EncounterId,
    IsPaid
}
export enum OrderFollowupFilters {
    Id,
    PatientId,
    EncounterId,
    OrderedDate,
    From,
    To,
    TestTypeId,
    FollowupStatusId,
    Patient,
    FacilityId,
    FollowupAppointmentOn,
    FromFollowup,
    ToFollowup
}
export enum TreatmentPlanFollowupFilters {
    Id,
    PatientId,
    EncounterId,
    TreatmentRequestDate,
    From,
    To,
    FollowupStatusId,
    Patient,
    FacilityId,
    TreatmentScheduleDate,
    FromScheduled,
    ToScheduled
}
export enum AdverseDrugReactionFilters {
    FacilityId,
    AdverseDrugReactionStatusId,
    Id,
    AdverseDrugReactionTypeId,
    DiagnosisId,
    PatientId,
    PatientNameMRN,
    FromDate,
    ToDate,
    SourceofDrugId,
    TypeofReactionId
}
export enum ExtravasationProformaFilters {
    FacilityId,
    ExtravasationProformaStatusId,
    Id,
    ExtravasationProformaTypeId,
    PatientId,
    PatientNameMRN,
    FromDate,
    ToDate
}
export enum IncidentReportingFilters {
    Id,
    FacilityId,
    IncidentReportingStatusId,
    IncidentReportingTypeId,
    FromDate,
    ToDate,
    ReportedBy,
    EmpId,
    UHID
}
export enum DocumentFilters {
    Id,
    GlobalWord,
    ActiveStatusId,
    FacilityId,
    DocumentStatusId,
    DepartmentId,
    DocumentForId,
    DocumentDate,
    From,
    To,
    ExpiryDate,
    ExpiryDateFrom,
    ExpiryDateTo
}
