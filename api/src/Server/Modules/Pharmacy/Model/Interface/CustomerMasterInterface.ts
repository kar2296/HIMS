import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CustomerMasterAttributes extends IAttributes {
    Id: number;
    CustomerCode: string;
    CustomerName: string;
    CustomerDescription: string;
    CustomerTypeId: number;
    OrganizationId: number;
    Pincode: string;
    Area: string;
    City: string;
    State: string;
    Country: string;
    MobileNumber: string;
    PhoneNumber: string;
    FaxNumber: string;
    EmailAddress: string;
    ContactPerson: string;
    BusinessDomainId: number;
    DistributionTypeId: number;
    PaymentTermsId: number;
    LicenceCode: string;
    GSTNumber: string;
    ProfitPercentage: number;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    CustomerUrl: string;
    CurrencyCodeId: number;
    ActiveStatusId: number;
    IsActive: boolean;
    ActiveFrom: Date;
    ActiveTo: Date;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CustomerMasterInstance extends Instance<CustomerMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CustomerMasterAttributes;
}
