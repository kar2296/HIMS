import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ServiceItemTariffDetailAttributes extends IAttributes {
    Id: number;
    ServiceItemId: number;
    ServiceRateCategoryId: number;
    FacilityId: number;
    Rate: number;
    EmergencyRate: number;
    PatientTypeId: number;
    ShareTypeId: number;
    DoctorShareValue: number;
    DoctorShare: number;
    EncounterTypeId: number;
    EffectiveFrom: Date;
    EffectiveTo: Date;
    CurrencyId: number;
    DiscountModeId: number;
    Discount: number;
    ExternalPrice: number;
    StatusId: boolean;
    TariffTypeId: number;
    InsuranceId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ServiceItemTariffDetailInstance extends Instance<ServiceItemTariffDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceItemTariffDetailAttributes;
}
