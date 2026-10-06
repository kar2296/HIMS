import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientEmarAttributes extends IAttributes {
    Id: number;
    PrescriptionDetailId: number;
    PatientDispenseId: number;
    DispenseDateTime: Date;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    DrugCode: string;
    DrugName: string;
    DrugFrequencyId: number;
    DrugRouteId: number;
    Dosage: string;
    Duration: number;
    DurationPeriodId: number;
    PrescriptionQuantity: number;
    PriorityId: number;
    CategoryId: number;
    SubCategoryId: number;
    ProductTypeId: number;
    SubProductTypeId: number;
    GenericId: number;
    GenericName: string;
    ManufacturerId: number;
    ManufacturerName: string;
    ScheduleTypeId: number;
    ScheduleTypeDescription: string;
    BaseUomId: number;
    SaleUomId: number;
    RequestedQuantity: number;
    DispensedQuantity: number;
    StockItemId: number;
    StockSerialItemId: number;
    StoreMasterId: number;
    DepartmentId: number;
    FacilityId: number;
    OrganizationId: number;
    BatchId: number;
    ExpiryDate: Date;
    DoctorId: number;
    PatientId:number;
    DoctorName: string;
    DispensedStatusId: number;
    PrescriptionStatusId: number;
    eMARStatusId: number;
    AdministerStartDate: Date;
    AdministerEndDate: Date;
    AdministerStatusId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientEmarInstance extends Instance<PatientEmarAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientEmarAttributes;
}
