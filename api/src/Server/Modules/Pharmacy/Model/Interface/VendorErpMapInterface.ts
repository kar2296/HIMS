import { IAudit } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VendorErpMapAttributes extends IAudit {
    Id: number;
    VendorFacilityMapId: number;
    VendorMasterId: number;
    VendorCode: string;
    VendorName: string;
    ErpAccountTypeId: number;
    ErpSubAccountTypeId: number;
    ErpGLClassTypeId: number;
    ErpGLClassName: string;
    ErpCreditAccountNo: string;
    ErpDebitAccountNo: string;
    BankId: number;
    BankAccountNo: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VendorErpMapInstance extends Instance<VendorErpMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VendorErpMapAttributes;
}
