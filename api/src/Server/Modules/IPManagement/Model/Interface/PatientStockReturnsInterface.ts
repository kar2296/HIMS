import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientStockReturnsAttributes extends IAttributes {
    Id: number;
    PatientStockRequestId: number;
    PatientReturnNumber: string;
    PatientReturnDateTime: Date;
    PatientReturnTypeId: number;
    PatientReturnSubTypeId: number;
    PatientReturnStatusId: number;
    PatientReturnPriorityId: number;
    PatientId: number;
    PatientTypeId: number;
    PatientMRN: string;
    PatientName: string;
    EncounterId: number;
    EncounterTypeId: number;
    DoctorId: number;
    DoctorName: string;
    ReferralId: number;
    ReferralName: string;
    DepartmentId: number;
    GuarantorId: number;
    GuarantorTypeId: number;
    GuarantorName: string;
    LocationId: number;
    WardId: number;
    RoomId: number;
    BedId: number;
    ToStoreId: number;
    ToStoreName: string;
    FacilityId: number;
    OrganisationId: number;
    TotalGrossAmount: number;
    TotalGstAmount: number;
    TotalNetAmount: number;
    CancelReasonId: number;
    ReturnedBy: string;
    ReturnedDate: Date;
    ReturnerComments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    RemarkId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientStockReturnsInstance extends Instance<PatientStockReturnsAttributes> {
    dataValues: PatientStockReturnsAttributes;
}


