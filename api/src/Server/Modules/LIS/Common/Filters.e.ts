export enum ContainertypeFilters {
    Id,
    Name,
    type,
    color,
    status
}
export enum SampletypeFilters {
    Id,
    Name,
    type,
    status,
    ismicro
}
export enum AnalytemasterFilters {
    Id,
    Name,
    AnalyteType,
    vtype,
    status,
    FacilityId,
    IsExcelUpload
}
export enum AnalyteAliasFilters {
    Id,
    Name,
    AnalyteId,
    AliasesType,
    status
}
export enum AnalyteRefFilters {
    Id,
    Gendere,
    AnalyteId,
    AnalyteRefType,
    status
}
export enum TestMasterFilters {
    Id,
    Name,
    IsProfile,
    type,
    dept,
    subdept,
    status,
    IsTestAnalyteMap,
    IncludeServiceDetails,//8
    ExcludeIds,
    IsSeparateWorkOrder, //10
    IsDirectBill, //11
    IsSeparateSampleId, //12
    Methodology, //13
    IsFreeBill, //14
    FacilityId,
    IsExcelUpload
}
export enum TestanalyteFilters {
    Id,
    TestMasterId,
    status
}
export enum TestdiagnosisFilters {
    Id,
    TestMasterId,
    DiagnosistypeId,
    DiagnosisId,
    status
}
export enum TestInstFilters {
    Id,
    TestMasterId,
    status
}
export enum TestmasterTemplateFilters {
    Id,
    TestMasterId,
    Name,
    status
}
export enum TestmasterBOMFilters {
    Id,
    TestMasterId,
    Name,
    status
}
export enum TestschemecodeFilters {
    Id,
    Name,
    TestMasterId,
    status
}
export enum TesttemplateFilters {
    Id,
    Name,
    TestMasterId,
    status
}
export enum ExternalprovidersFilters {
    Id,
    Name,
    status
}
export enum TicksheetFilters {
    Id,
    Name,
    status
}
export enum PatientOrderStatusFilters {
    Id,
    Encountersorderid
}
export enum PatientWorkorderFilters {
    Id, //0
    Name, //1
    PendingAssignment, //2
    WorkOrderStatus, //3
    IsOrderAssigned, //4
    MyOrders, //5
    TestType, //6
    PatientId,  //7
    PatientNameMRN, //8
    WorkOrderdid, //9
    Ordereddate, //10
    From, //11
    To, //12
    Orderedbyid, //13
    Departmentid, //14
    Orderid, //15
    EncounterType, //16
    LabAssignType, //17
    ExternalProvider, //18
    MedValidationdate, //19
    Fromapprove,  //20
    Toapprove,  //21
    WardId, // 22
    Subdepartmentid, //23
    EncounterId,   //24
    TechValidationdate,  //25
    FromTech,    //26
    ToTech,    //27
    OrderNumber,   //28
    Facilityid, // 29
    VisitIdentifier, //30
    ReferenceNo,  //31
    PatOrderBill, //32
    IsRejected,
    IsExternalLab,
    SampleIdentifier,
    ParentWorkOrderId,
    CreatedAt,
    CreatedAtFrom,
    CreatedAtTo,
    OrderStatusId //40
}
export enum PatientWorkorderdetailsFilters {
    Id, //0
    WorkOrderId, //1
    Orderid, //2
    EncounterId, //3
    PatientId, //4
    WorkOrderDetailStatusId, //5
    TestIds, //6
    IncludeObservations, //7
    SubDepartmentId, //8
    TestValueTypeId, //9
    From, //10
    To, //11
    Patient, //12
    DoctorId, //13
    OrderStatusId, //14
    TestTypeId, //15
    OrderNumber, //16
    QualifierId, //17
    OrderRequestDate, //18
    FromReq, //19
    ToReq, //20
    Sampleid, //21
    EquipmentId, //22
    Orderdetailid, //23
    TestName, //24
    WorkOrderStatusId, //25
    WorkOrderdid, //26
    ImpressionId,  //27
    ClinicalFindingId, //28
    Testid,   //29
    MedValidationById,  //30
    EncounterTypeId,  //31
    AcceptedDate,  //32
    FromAccDate,  //33
    ToAccDate,  //34
    IsLISRequest, //35
    Analyteid,
    Ids,
    MultiWorkOrderStatus
}
export enum WorkOrderSampleFilters {
    Id,
    WorkOrderId,
    OrderNo,
    PatientType,
    PatientNameMRN,
    SampleStatus,
    OrderRequestDate,
    OrderStatus,
    DoctorId,
    OrderFromId,
    From,
    To,
    WardId,
    GuarantorId,
    GuarantorTypeId,
    SubDepartmentId,
    WorkOrderdid,
    FacilityId,
    VisitIdentifier,
    PatientOrderId,
    PatNameOrderNo,
    MultiSampleStatus,
    CreatedFrom,
    CreatedTo,
    CreatedAtFrom,
    CreatedAtTo
}
export enum WorkOrderSampleDetailFilters {
    Id,
    WorkOrderSampleId,
    SampleIdentifier,
}
export enum ExternalProviderFilters {
    Id,
    FacilityId,
    TESTMASTERTYPId,
    ActiveStatusId,
    ProviderName
}
export enum PriceMappingFilters {
    Id,
    TestmasterId,
    TESTMASTERTYPId,
    ActiveStatusId,
    TestId,
    ExternalProviderId,
    TestName,
    Price
}

export enum WorkOrderAttachmentFilters {
    Id,
    Name,
    PatientId,
    WorkOrderId,
    WorkOrderDetailId
}

export enum WorkOrderObservationFilters {
    Id,
    PatientId,
    WorkOrderId,
    WorkOrderDetailId
}

export enum OrderTATFilters {
    Id,
    Name,
    PatientNameMRN,
    TestName,
    PatientId,
    PatientOrderId,
    PatientOrderDetailId,
    TestId,
    AcceptedOn,
    OrderedOn,
    From,
    To,
    AcceptFrom,
    AcceptTo,
    TestTypeId,
    SubDepartmentId,
    Approvedbyid,
    FacilityId
}

export enum AnalyzerTestFilters {
    Id,
    Code,
    Name,
    AssetName,
    AssetId,
    ActiveStatusId,
}

export enum AnalyzerAnalyteMapFilters {
    Id,
    Name,
    AssetName,
    ActiveStatusId,
    AnalyteId,
    AssetId,
    Code,
    AnalyteName,
}

export enum AnalyserTemplateFilters {
    Id,
    GenderId,
    AnalyserTemplateTypeId,
    ActiveStatusId,
    AnalyteId,
}

export enum LISInterfaceResultsFilters {
    Id,
    AssetId,
    Sampleid,
    Code,
    LISId,
    PatientName,
    MRNNo,
    FromDate,
    ToDate,//8
    Approved,
    VisitType,
    VisitIdentifier,
    FacilityId,
    WorkOrderId,
    AnalyteId,
    ResultValue
}

export enum LISInterfacePatientDetailsFilters {
    Id,
    AssetId,
    Sampleid,
    PatientId,
    EncounterId,
    CreatedAt,
    MRN,
    VisitIdentifier,
    EncounterTypeId,
    Approved,
    Rejected,
    PatientInfo,
    WOPatientInfo
}
export enum AntibioticMasterFilters {
    Id,
    Code,
    MnemonicName,
    Type,
    status,
    OrganismId
}
export enum PatientWorkOrderAntibioticsFilters {
    Id,
    WorkorderId
}
export enum OrgIsolationFilters {
    Id,
    Code,
    MnemonicName,
    status,
}
export enum AntibioticOrganismFilters {
    Id,
    AntibioticId,
    OrganismMapId
}
export enum B2BCustomerMasterFilters {
    Id,
    FacilityId,
    TESTMASTERTYPId,
    ActiveStatusId,
    B2BCustomerName
}
export enum OrderStatusFilters {
    Id,
    Name,
    IsDietStatus
}
export enum PatientCriticalOrderFilters {
    Id,
    PatientId,
    PatientOrderId,
    PatientOrderDetailId,
    PatientNameMRN,
    TestName,
    TestTypeId,
    SubDepartmentId,
    Approvedbyid,
    FacilityId,
    DoctorId,
    From,
    To,
    EncounterTypeId,
    PatientWorkOrderDetailId,
    TestId,
    AnalyteId
}
export enum RISInterfaceResultFilters {
    Id,
    RISId,
    FacilityId,
    WorkOrderId,
    AnalyteId
}
