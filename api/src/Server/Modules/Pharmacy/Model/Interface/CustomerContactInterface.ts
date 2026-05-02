import { IAudit } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CustomerContactAttributes extends IAudit {
    Id: number;
    CustomerMasterId: number;
    CustomerCode: string;
    CustomerName: string;
    ContactTypeId: number;
    ContactPerson: string;
    MobileNo: string;
    PhoneNo: string;
	EMail: string;
	IsPrimary: boolean;
    AddressLine1: string;
	AddressLine2: string;
	PinCodeId: number;
	Area: string;
	CityId: number;
	StateId: number;
	CountryId: number;
	DistrictId: number;
	ContactStatusId: number;
	IsActive: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CustomerContactInstance extends Instance<CustomerContactAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CustomerContactAttributes;
}
