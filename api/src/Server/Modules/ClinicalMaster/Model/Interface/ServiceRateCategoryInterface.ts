import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ServiceRateCategoryAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    ServiceRateCategory: string;
    Description: string;
    EncounterTypeId: number;
    PrimaryCategoryId: number;
    Percentage: string;
    IsActive: boolean;
    IsBasic: boolean;
    IsDefault: boolean;
    IsAllFacility: boolean;
    OrderMasterStatusId: boolean;
    ActiveStatusId: number;
    TariffTypeId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    IsExcelUpload: boolean;

}

export interface ServiceRateCategoryInstance extends Instance<ServiceRateCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceRateCategoryAttributes;
}
