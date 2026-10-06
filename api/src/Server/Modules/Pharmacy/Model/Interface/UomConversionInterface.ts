import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface UomConversionAttributes extends IAttributes {
    Id: number;
    ItemMasterId: number;
    UomTypeId: number;
    UomTypeCode: string;
    UomTypeName: string;
    UomId: number;
    UomCode: string;
    UomName: string;
    ConversionQuantity: number;
    FacilityId: number;
    OrganizationId: number;
    DisplayOrder: number;
    StatusId: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface UomConversionInstance extends Instance<UomConversionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: UomConversionAttributes;
}
