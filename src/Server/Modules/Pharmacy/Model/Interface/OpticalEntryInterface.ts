import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OpticalEntryAttributes extends IAttributes {
    Id: number;
    OrderNo: string;
    OrderDate: Date;
    OrderStatusId: number;
    FacilityId: number;
    OrganizationId: number;
    PatientId: number;
    DoctorId: number;
    AddressLine1: string;
    AddressLine2: string;
    OpticalSize: string;
    FrameColor: string;
    LensTypeId: number;
    GrindingCharges: number;
    Remarks: string;
    RightDVSPH: string;
    RightDVCYL: string;
    RightDVAXIS: string;
    RightNVSPH: string;
    RightNVCYL: string;
    RightNVAXIS: string;
    LeftDVSPH: string;
    LeftDVCYL: string;
    LeftDVAXIS: string;
    LeftNVSPH: string;
    LeftNVCYL: string;
    LeftNVAXIS: string;
    DeliveryDate: Date;
    TotalAmount: number;
    AdvanceAmount: number;
    BalanceAmount: number;
    ReceivedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OpticalEntryInstance extends Instance<OpticalEntryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OpticalEntryAttributes;
}
