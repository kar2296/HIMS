import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface WardInsuranceTariffAttributes extends IAttributes {
    Id: number;
    WardId: number;
    FacilityId: number;
    InsuranceId: number;
    GuarantorTypeId: number;
    RateTypeId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WardInsuranceTariffInstance extends Instance<WardInsuranceTariffAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WardInsuranceTariffAttributes;
}
