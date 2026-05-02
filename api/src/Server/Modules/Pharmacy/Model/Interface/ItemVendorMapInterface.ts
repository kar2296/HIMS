import { IAudit } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ItemVendorMapAttributes extends IAudit {
    Id: number;
    ItemFacilityMapId: number;
    FacilityId: number;
    ItemMasterId: number;
    CategoryId: number;
    VendorMasterId: number;
    ActiveStatusId: number;
    FacilityCode: string;
    ItemCode: string;
    VendorCode: string;
    FacilityName: string;
    ItemName: string;
    VendorName: string;
    LeadTime: number;
    CreditDays: number;
    ProductTypeId: number;
    PurchaseUomId: number;
    PurchaseUomCode: string;
    ConversionQuantity: number;
    SaleUomId: number;
    SaleUomCode: string;
    RankId: number;
    ContactPerson: string;
    ContactNumber: string;
    MinQty: number;
    MaxQty: number;
    FreeQty: number;
    UomPrice: number;
    UomMrPrice: number;
    Price: number;
    MrPrice: number;
    DiscountModeId: number;
    DiscountModeCode: string;
    Discount: number;
    GstId: number;
    InGstId: number;
    CGstId: number;
    SGstId: number;
    GstCode: string;
    GstName: string;
    GstPercentage: number;
    IsActive: boolean;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ItemVendorMapInstance extends Instance<ItemVendorMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ItemVendorMapAttributes;
}
