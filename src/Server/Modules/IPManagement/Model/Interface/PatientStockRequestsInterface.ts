import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientStockRequestsAttributes extends IAttributes {
    Id: number;
    PatientRequestNumber: string;
    PatientRequestDateTime: Date;
    PatientRequestTypeId: number;
    PatientRequestSubTypeId: number;
    PatientRequestStatusId: number;
    PatientRequestPriorityId: number;
    PrescriptionId: number;
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
    OTRoomId: number;
    OTRegisterId: number;
    OTIdentifier: string;
    ToStoreId: number;
    ToStoreName: string;
    FacilityId: number;
    OrganisationId: number;
    TotalGrossAmount: number;
    TotalGstAmount: number;
    TotalNetAmount: number;
    CancelledBy: number;
    CancelledDate: Date;
    CancelledComments: string;
    CancelReasonId: number;
    RequestedBy: number;
    RequestedDate: Date;
    RequesterComments: string;
    AuthorizedBy: number;
    AuthorizedDate: Date;
    AuthorizerComments: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    RemarkId: number;
    IsSurgery: boolean;
    IsCash: boolean;
    DispenseDateTime: Date;
	DispensedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientStockRequestsInstance extends Instance<PatientStockRequestsAttributes> {
    dataValues: PatientStockRequestsAttributes;
}


