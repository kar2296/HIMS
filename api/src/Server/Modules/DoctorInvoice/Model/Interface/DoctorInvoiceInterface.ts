import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DoctorInvoiceAttributes extends IAttributes {
    Id: number;
    DoctorInvoiceIdentifier: string;
    DoctorId: number;
    InvoiceDateTime: Date;
    InvoiceAmount: number;
    FacilityId: number;
    DoctorInvoiceStatusId: number;
    IsFullyPaid: number;
    AmountPaid: number;
    DueAmount: number;
    VisitTypeId: number;
    TDSId: number;
    TDSAmount: number;
    TDSPercentage: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface DoctorInvoiceInstance extends Instance<DoctorInvoiceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DoctorInvoiceAttributes;
}
