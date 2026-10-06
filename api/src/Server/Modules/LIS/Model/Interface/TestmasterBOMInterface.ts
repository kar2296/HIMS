import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TestmasterBOMAttributes extends IAttributes {
    Id: number;
    TestmasterId: number;
    BOMType: number;
    Comments: string;
    IsDefault: boolean;
    ItemCategoryId: number;
    ItemSubCategoryId: number;
    ItemId: number;
    ItemCode: string;
    ItemName: string;
    UCP: number;
	CostPrice: number;
    OtherCost: number;
    ProductTypeId: number;
    ProductSubTypeId: number;
    Quantity: number;
    Wastage: number;
    QC: number;
    NoOfTests: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    ActiveStatusId: number;
}

export interface TestmasterBOMInstance extends Instance<TestmasterBOMAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TestmasterBOMAttributes;
}
