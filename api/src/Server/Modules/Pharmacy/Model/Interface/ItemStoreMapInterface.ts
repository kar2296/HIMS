import { IAudit } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ItemStoreMapAttributes extends IAudit {
    Id: number;
    ItemFacilityMapId: number;
    ItemMasterId: number;
    StoreMasterId: number;
    FacilityId: number;
    RackId: number;
    CategoryId: number;
    SubCategoryId: number;
    ProductTypeId: number;
    SubProductTypeId: number;
    ItemCode: string;
    StoreCode: string;
    FacilityCode: string;
    RackCode: string;
    ItemName: string;
    StoreName: string;
    FacilityName: string;
    RackName: string;
    Self: string;
    Tray: string;
    MinQty: number;
    MaxQty: number;
    ROLQty: number;
    LeadTime: number;
    MaxForeCast: number;
    FactorOnUnReliable: number;
    TargetInventory: number;
    BReT: number;
    OLT: number;
    PLT: number;
    TLT: number;
    SLT: number;
    RT: number;
    IsBillable: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ItemStoreMapInstance extends Instance<ItemStoreMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ItemStoreMapAttributes;
}
