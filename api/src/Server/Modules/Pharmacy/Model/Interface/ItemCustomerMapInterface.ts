import { IAudit } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ItemCustomerMapAttributes extends IAudit {
    Id: number;
    ItemFacilityMapId: number;
    FacilityId: number;
    CustomerMasterId: number;
    ItemMasterId: number;
    FacilityCode: string;
    CustomerCode: string;
    ItemCode: string;
    FacilityName: string;
    CustomerName: string;
    ItemName: string;
    CategoryId: number;
    SubCategoryId: number;
    ProductTypeId: number;
    SubProductTypeId: number;
    PurchaseUomId: number;
    PurchaseUomCode: string;
    ConversionQuantity: number;
    SaleUomId: number;
    SaleUomCode: string;
    MinQty: number;
    MaxQty: number;
    FreeQty: number;
    UomPrice: number;
    UomCrPrice: number;
    UomMrPrice: number;
    Price: number;
    CrPrice: number;
    MrPrice: number;
    DiscountModeId: number;
    DiscountModeCode: string;
    Discount: number;
    GstId: number;
    GstCode: string;
    GstName: string;
    GstPercentage: number;
    CGstId: number;
    CGstCode: string;
    CGstName: string;
    CGstPercentage: number;
    SGstId: number;
    SGstCode: string;
    SGstName: string;
    SGstPercentage: number;
    ActiveStatusId: number;
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

export interface ItemCustomerMapInstance extends Instance<ItemCustomerMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ItemCustomerMapAttributes;
}
