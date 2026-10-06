import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StoreMasterDetailAttributes extends IAttributes {
    Id: number;
    StoreMasterId: number;
    StoreCode: string;
    StoreName: string;
    StoreDescription: string;
    StoreTypeId: number;
    FacilityId: number;
    LicenseNo: string;
    TinNo: string;
    Email: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    WholeSaleLicenseNumber1: number;
    WholeSaleLicenseNumber2: number;
}

export interface StoreMasterDetailInstance extends Instance<StoreMasterDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StoreMasterDetailAttributes;
}
