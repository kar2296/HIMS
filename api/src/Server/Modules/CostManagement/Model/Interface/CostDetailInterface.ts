import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CostDetailAttributes extends IAttributes {
    Id: number;
    DepartmentId: number;
    ActiveStatusId: number;
    FacilityId: number;
    ServiceId: number;
    ItemCode: string;
    ItemName: string;
    Description: string;
    FilmSize: string;
    OpTariff: number;
    IpTariff: number;
    InsuranceTariff: number;
    FilmCost: number;
    TypeId:number;
    StationaryCost: number;
    ConsumablesCost: number;
    MedicineCost: number;
    OtherCost: number;
    TotalCost: number;
    StationedFixedCost: number;
    StationedAMCCost: number;
    MobileFixedCost: number;
    TotalMobileCost: number;
    MobileAMCCost: number;
    Casette: number;
    Comments: string;
    NotionalRent: number;
    RadiationCost: number;
    RegistrationCost: number;
    EquipmentOtherCost: number;
    TotalStationedFixedCost: number;
    TotalMobileFixedCost: number;
    TechnicianCost: number;
    NurseCost: number;
    DoctorCost: number;
    ExternalDoctorCost: number;
    TotalLabourCost: number;
    StationedPowerCost: number;
    MobilePowerCost: number;
    StationedVariableCost: number;
    MobileVariableCost: number;
    TotalStationedCost: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CostDetailInstance extends Instance<CostDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CostDetailAttributes;
}
