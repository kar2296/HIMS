import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualMedicineOrderAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    MedicineOrderNo: string;
    DoctorId: number;
    PatientId: number;
    EncounterId: number;
    FirstName: string;
    LastName: string;
    PrescriptionAttachment: string;
    InvoiceAttachment:string;
    MedicineOrderDate: Date;
    DeliveryDate: Date;
    DeliveryAddress: string;
    PinCode: string;
    CityId: number;
    StateId: number;
    LandMark: string;
    latitudeId: number;
    longitudeId: number;
    MedicineOrderStatusId: number;
    PhoneNo: string;
    PharmacyId: number;
    PaymentModeId: number;
    OrderAmount: number;
    DeliveryAmount: number;
    TotalNetAmount: number;
    OrderComments:string;
    DeliveryPerson:string;
    DeliveryComments:string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualMedicineOrderInstance extends Instance<VirtualMedicineOrderAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualMedicineOrderAttributes;
}
