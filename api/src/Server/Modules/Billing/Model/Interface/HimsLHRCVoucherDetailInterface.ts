import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LHRCVoucherDetailAttributes extends IAttributes {
    Id: number;
    LHRCVoucherId: number;
    PatientId: number;
    AmbulanceName: string;
    DriverName: string;
    VehicleName: string;
    PayTo: string;
    VoucherAmount: number;
    Mobile: string;
    Remarks: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LHRCVoucherDetailInstance extends Instance<LHRCVoucherDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LHRCVoucherDetailAttributes;
}
