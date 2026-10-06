import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DoctorInvoiceDetailsAttributes extends IAttributes {
    Id: number;
    DoctorInvoiceId: number;
    EncounterId: number;
    PatientBillId: number;
    PatientBillDetailId: number;
    DoctorId: number;
    DoctorName:number;
    InvoiceDateTime: Date;
    ServiceId: number;
    ServiceName: string;
    DoctorShare: number;
    FacilityId: number;
    InvoiceStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DoctorInvoiceDetailsInstance extends Instance<DoctorInvoiceDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DoctorInvoiceDetailsAttributes;
}
