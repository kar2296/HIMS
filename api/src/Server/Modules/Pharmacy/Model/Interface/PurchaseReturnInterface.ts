import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PurchaseReturnAttributes extends IAttributes {
	PurchaseReturnId: number;
	PrnNumber: string;
	PrnDate: Date;
	PrnTypeId: number;
	PrnStatusId: number;
	ReturnReasonId: number;
	VendorMasterId: number;
	StoreTypeId: number;
	StoreMasterId: number;
	DepartmentId: number;
	LocationId: number;
	ReturnTypeId: number;
	FacilityId: number;
	OrganisationId: number;
	PurchaseOrderId: number;
	GrnId: number;
	ReturnedBy: number;
	ReturnedDate: Date;
	ReturnerComments: string;
	AuthorizedBy: number;
	AuthorizedDate: Date;
	AuthorizerComments: string;
	ApprovedBy: number;
	ApprovedDate: Date;
	ApproverComments: string;
	IsCanceled: boolean;
	CancelReasonId: number;
	TotalGrossAmount: number;
	TotalDiscountAmount: number;
	TotalGstAmount: number;
	TotalInGstAmount: number;
	TotalCGstAmount: number;
	TotalSGstAmount: number;
	ShippingCharges: number;
	OtherCharges: number;
	RoundOff: number;
	TotalNetAmount: number;
	TotalReturnAmount: number;
	TallyApprovedStatusId: number;
	Comments: string;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
	CancelledBy: number;
	CancelledAt: Date;
}

export interface PurchaseReturnInstance extends Instance<PurchaseReturnAttributes> {
	dataValues: PurchaseReturnAttributes;
}


