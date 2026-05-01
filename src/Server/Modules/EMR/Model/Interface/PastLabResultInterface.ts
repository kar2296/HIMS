import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PastLabResultAttributes extends IAttributes {
    Id: number;
    WorkOrderdid: string;
    Orderdetailid: number;
    Orderid: number;
    Encounterorderid: number;
    PatientId: number;
    Encounterid: string;
    Orderedbyid: number;
    Orderedbyname: string;
    WorkOrderStatusId: number;
    Ordereddate: Date;
    Departmentid: number;
    Subdepartmentid: number;
    DepartmentrefNo: string;
    Receiveddate: Date;
    Reporteddate: Date;
    Approvedbyid: number;
    Approvedbyname: string;
    ExternallabId: number;
    TechValidationById: number;
    TechValidationByName: string;
    TechValidationdate: Date;
    MedValidationById: number;
    MedValidationByName: string;
    MedValidationdate: Date;
    OrderPriorityId: number;
    UserId: number;
    ApprovalSubmisdate: Date;
    Assigndate: Date;
    Reason: string;
    TESTMASTERTYPId: number;
    LabAssignTypeId: number;
    Orderedby: string;
    ReleasedBy: string;
    ReleasedDate: Date;
    LabName: string;
    // Attachments: string;
    ReleaseToPatientId: number;
    YesNoId: number;
    FilePath: string;
    Name: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PastLabResultInstance extends Instance<PastLabResultAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PastLabResultAttributes;
}
