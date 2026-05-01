import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDispenseDetailsAttributes extends IAttributes {
	Id: number;
	PatientStockRequestDetailId: number;
	PatientDispenseId: number;
	DispenseDateTime: Date;
	ItemMasterId: number;
	ItemCode: string;
	ItemName: string;
	ReqItemMasterId: number;
	ReqItemCode: string;
	ReqItemName: string;
	IsAlternateIssued: boolean;
	CategoryId: number;
	SubCategoryId: number;
	ProductTypeId: number;
	SubProductTypeId: number;
	GenericId: number;
	GenericName: string;
	ManufacturerId: number;
	ManufacturerName: string;
	ScheduleTypeId: number;
	ScheduleTypeDescription: string;
	BaseUomId: number;
	PurchaseUomId: number;
	SaleUomId: number;
	RequestedQuantity: number;
	QuantityBeforeDispense: number;
	DispensedQuantity: number;
	StockItemId: number;
	StockSerialItemId: number;
	StoreMasterId: number;
	DepartmentId: number;
	FacilityId: number;
	OrganizationId: number;
	BatchId: string;
	ExpiryDate: Date;
	Ucp: number;
	Mrp: number;
	Amount: number;
	GrossAmount: number;
	GrossGstAmount: number;
	DiscountModeId: number;
	DiscountValue: number;
	DiscountAmount: number;
	DoctorDiscountAmount: number;
	GstId: number;
	GstPercentage: number;
	UnitGstAmount: number;
	GstAmount: number;
	InGstId: number;
	InGstPercentage: number;
	UnitInGstAmount: number;
	InGstAmount: number;
	CGstId: number;
	CGstPercentage: number;
	UnitCGstAmount: number;
	CGstAmount: number;
	SGstId: number;
	SGstPercentage: number;
	UnitSGstAmount: number;
	SGstAmount: number;
	NetAmountBeforeGst: number;
	NetAmount: number;
	InsNetAmount: number;
    PatNetAmount: number;
	DoctorId: number;
	DoctorName: string;
	IsGstDoctor: boolean;
	Comments: string;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface PatientDispenseDetailsInstance extends Instance<PatientDispenseDetailsAttributes> {
	dataValues: PatientDispenseDetailsAttributes;
}


