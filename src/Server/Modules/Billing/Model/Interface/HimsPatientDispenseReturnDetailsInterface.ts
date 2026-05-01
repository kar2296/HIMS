import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDispenseReturnDetailsAttributes extends IAttributes {
	Id: number;
	PatientStockReturnDetailId: number;
	PatientDispenseReturnId: number;
	DispenseReturnDateTime: Date;
	ItemMasterId: number;
	ItemCode: string;
	ItemName: string;
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
	SaleUomId: number;
	ReturnedQuantity: number;
	QuantityBeforeReceive: number;
	AcceptedQuantity: number;
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
	GstAmount: number;
	InGstId: number;
	InGstPercentage: number;
	InGstAmount: number;
	CGstId: number;
	CGstPercentage: number;
	CGstAmount: number;
	SGstId: number;
	SGstPercentage: number;
	SGstAmount: number;
	NetAmountBeforeGst: number;
	NetAmount: number;
	DoctorId: number;
	DoctorName: string;
	IsGstDoctor: boolean;
	InsNetAmount: number;
    PatNetAmount: number;
	Comments: string;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface PatientDispenseReturnDetailsInstance extends Instance<PatientDispenseReturnDetailsAttributes> {
	dataValues: PatientDispenseReturnDetailsAttributes;
}


