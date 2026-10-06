import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetAttributes extends IAttributes {
    Id: number;
    AssetCode: string;
    AssetName: string;
    Description: string;
    AssetCategoryId: number;
    AssetTypeId: number;
    ShortCode: string;
    ModelNum: string;
    ModelName: string;
    Serial: string;
    Barcode: string;
    Image: string;
    PhotoPath: string;
    Manufacturer: string;
    VendorId: number;
    PONum: string;
    GRNNum: string;
    PO: Date;
    GRN: Date;
    DateOfSold: Date;
    Contact: string;
    ContactPerson: string;
    PurchaseValue: number;
    CurrentValue: number;
    DepreciationValue: number;
    DateAcquired: Date;
    InstalledOn: Date;
    InstalledDepartmentId: number;
    DepartmentId: number;
    Employee: string;
    InstallDetails: string;
    InstalledBy: string;
    VerifiedById: number;
    ApprovedById: number;
    InstallationCharges: number;
    OtherInformations: string;
    IsActive: boolean;
	IsLabInterface: boolean;
    ActiveStatusId: number;
	 RemarkId: number;
	 FacilityId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetInstance extends Instance<AssetAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetAttributes;
}
