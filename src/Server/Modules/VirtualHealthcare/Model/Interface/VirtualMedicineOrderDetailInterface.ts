import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualMedicineOrderDetailAttributes extends IAttributes {
    Id: number;
    MedicineOrderId: number;
    OrganizationId: number;
    FacilityId: number;
    DoctorId: number;
    PatientId: number;
    EncounterId: number;
    DrugId?: number;
    DrugCode: string;
    DrugName: string;
    MedicineOrderDate: Date;
    MedicineOrderStatusId: number;
    PharmacyId: number;
    OrderAmount: number;
    DeliveryAmount: number;
    TotalNetAmount: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualMedicineOrderDetailInstance extends Instance<VirtualMedicineOrderDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualMedicineOrderDetailAttributes;
}
