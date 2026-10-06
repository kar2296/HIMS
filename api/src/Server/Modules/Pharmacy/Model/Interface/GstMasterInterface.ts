import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GstMasterAttributes extends IAttributes {
    Id: number;
    GstCode: string;
    GstName: string;
    GstDescription: string;
    FacilityId: number;
    IsAllFacility: boolean;
    GstPercentage: number;
    ParentGstId: number;
    ChildGstId: number;
    IsActive: boolean;
    IsParent: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GstMasterInstance extends Instance<GstMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GstMasterAttributes;
}
