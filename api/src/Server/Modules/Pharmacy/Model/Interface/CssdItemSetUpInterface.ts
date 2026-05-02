import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CssdItemSetUpAttributes extends IAttributes {
    Id: number;
    ItemCode: string;
    ItemName: string;
    ItemMasterId: number;
    StoreMasterId: number;
    FacilityId: number;
    CSSDTypeId: number;
    UsageTypeId: number;
    IsReusable: boolean;
    MaxUsage: boolean;
    MinUsage: boolean;
    PackingTypeId: number;
    ProductTypeId: number;
    IsSterilizationRequired: boolean;
    IsWashingRequired: boolean;
    WashingTypeId: number;
    IsPackingRequired: boolean;
    SterileTemperature: string;
    Instructions: string;
    IsActive: boolean;
    Activefrom: Date;
    Activeto: Date;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CssdItemSetUpInstance extends Instance<CssdItemSetUpAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CssdItemSetUpAttributes;
}
