import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientEmarDetailsAttributes extends IAttributes {
    Id: number;
    PatienteMARId: number;
    DrugCode: string;
    DrugName: string;
    DrugFrequencyId: number;
    DrugRouteId: number;
    Dosage: string;
    Duration: number;
    DurationPeriodId: number;
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
    DispensedStatusId: number;
    PrescriptionStatusId: number;
    AdministerStartDate: Date;
    AdministerEndDate: Date;
    AdministerStatusId: number;
    AdministeredBy: number;
    PrescriptionQuantity: number;
    DispensedQuantity: number;
    AdministerQuantity: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientEmarDetailsInstance extends Instance<PatientEmarDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientEmarDetailsAttributes;
}
