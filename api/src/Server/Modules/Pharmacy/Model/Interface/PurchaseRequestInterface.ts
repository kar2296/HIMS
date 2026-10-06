import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PurchaseRequestAttributes extends IAttributes {
	Id: number;
	PrNumber: string;
	PrTypeId: number;
	VendorFacilityMapId: number;
	VendorMasterId: number;
	StoreMasterId: number;
	VendorName: string;
	ToStoreMasterId: number;
	DepartmentId: number;
	LocationId: number;
	FacilityId: number;
	OrganisationId: number;
	RequestedBy: number;
	RequestedDate: Date;
	RequesterComments: string;
	AuthorizedBy: number;
	AuthorizedDate: Date;
	AuthorizerComments: string;
	ApprovedBy: number;
	ApprovedDate: Date;
	ApproverComments: string;
	CancelledBy: number;
	CancelledDate: Date;
	CancelledComments: string;
	TotalGrossAmount: number;
	TotalDiscountAmount: number;
	TotalGstAmount: number;
	TotalInGstAmount: number;
	TotalCGstAmount: number;
	TotalSGstAmount: number;
	TotalNetAmount: number;
	ExpectedDeliveryDate: Date;
	Comments: string;
	PrStatusId: number;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface PurchaseRequestInstance extends Instance<PurchaseRequestAttributes> {
	dataValues: PurchaseRequestAttributes;
}


