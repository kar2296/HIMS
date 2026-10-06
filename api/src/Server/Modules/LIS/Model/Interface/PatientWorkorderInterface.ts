import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientWorkorderAttributes extends IAttributes {
    Id: number;
    WorkOrderId: string;
    Orderdetailid: number;
    Orderid: number;
    Encounterorderid: number;
    Patientid: number;
    EncounterId: number;
    ConsultationId: number;
    Orderedbyid: number;
    Orderedbyname: string;
    WorkOrderStatusId: number;
    Ordereddate: Date;
    Departmentid: number;
    Subdepartmentid: number;
    DepartmentrefNo: string;
    Reporteddate: Date;
    Approvedbyid: number;
    Approvedbyname: string;
    ExternalProviderId: number;
    TechValidationById: number;
    TechValidationByName: string;
    TechValidationdate: Date;
    MedValidationById: number;
    MedValidationByName: string;
    MedValidationdate: Date;
    ReceivedDate: Date;
    OrderPriorityId: number;
    UserId: number;
    ApprovalSubmisdate: Date;
    Assigndate: Date;
    TestTypeId: number;
    LabAssignTypeId: number;
    ReleasedBy: number;
    ReleasedDate: Date;
    ReferenceNo: string;
    IsReleased: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    Reason: string;
    OtherFacilityId: number;
    FacilityId: number;
    PatientName: string;
    PatientMrn: string;
    PatientMobile: string;
    IsRejected: boolean;
    SampleIdentifier: string;
    IsExternalLab: boolean;
    IsPrinted: boolean;
    IsCulture: boolean;
    ExternalOrderStatusId: number;
    ParentWorkOrderId: number;
    PrintableComments: string;
    NonPrintableComments: string;
    ResultEnteredBy: number;
    SpecimenId: number;
    BlockId: number;
    ResultTypeId: number;
    ApprovedUserBy: number;
    IsCriticalOrder: boolean;
}

export interface PatientWorkorderInstance extends Instance<PatientWorkorderAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientWorkorderAttributes;
}
