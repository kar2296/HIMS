import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VendorMasterGSTAttributes extends IAttributes {
    Id: number;
    VendorFacilityMapId: number;
    VendorMasterId: number;
    IsGSTRegistered: boolean;
    GSTId: string;
    BusinessRegNo: string;
    BusinessName: string;
    BusinessAddress: string;
    TaxCode: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VendorMasterGSTInstance extends Instance<VendorMasterGSTAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VendorMasterGSTAttributes;
}
