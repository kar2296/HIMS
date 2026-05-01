import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ServiceCategoryAttributes extends IAttributes {
    Id: number;
    ParentServiceCategoryId: number;
    ServiceCategoryCode: string;
    ServiceCategoryName: string;
    Description: string;
    ServiceGroupId: number;
    OrganizationId: number;
    FacilityId: number;
    DisplayOrder: number;
    PrintOrder: number;
    StatusId: boolean;
    IsDiagnosisMandatory: boolean;
    IsGenerateDoctorInvoice: boolean;
    IsDoctorMandatory: boolean;
    IsDoctorShare: boolean;
    ShowPopUpWhileOrder: boolean;
    ShowDuplicateEntry: boolean;
    ShowRefuseToBuy: boolean;
    IsAllFacility: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    Priorities?: any;
}

export interface ServiceCategoryInstance extends Instance<ServiceCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ServiceCategoryAttributes;
}
