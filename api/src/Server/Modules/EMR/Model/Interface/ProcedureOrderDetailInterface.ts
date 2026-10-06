import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ProcedureOrderDetailAttributes extends IAttributes {
	Id: number;
	ProcedureOrderId: number;
	PatientId: number;
	EncounterId: number;
	DepartmentId: number;
	SubDepartmentId: number;
	MasterObjectTypeId: number;
	MasterId: number;
	ProcedureTypeId: number;
	ProcedureId: number;
	ProcedureCode: string;
	ProcedureName: string;
	ProcedureDescription: string;
	ProcedurePrice: number;
	ServiceItemId: number;
	ServiceCode: string;
	OrderLocationId: number;
	ServiceName: string;
	ServiceCategoryId: number;
	ServiceCategoryName: string;
	ServicePrice: number;
	Quantity: number;
	GstId: number;
	GstPercentage: number;
	NetAmount: number;
	DiagnosisId: number;
	IsOrdered: number;
	DoctorId: number;
	OrderFromLocationId: number;
	OrderToLocationId: number;
	OrderStatusId: number;
	OrderPriorityId: number;
	ProcedureInstructions: string;
	GuarantorId: number;
	IsSelf: boolean;
	IsAlertRequired: number;
	ScheduleDate: Date;
	IsProcessed: number;
	ResultEstimatedDate: Date;
	IsCanceled: number;
	CanceledById: number;
	CanceledDateTime: Date;
	PatientBillDetailId: number;
	PatientBillId: number;
	PatientBillStatusId: number;
	IsDirectBill: boolean;
	ToothNo: string;
	Comments: string;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface ProcedureOrderDetailInstance extends Instance<ProcedureOrderDetailAttributes> {
	// I'm exposing every DB column as an instance field to so that tsc won't complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: ProcedureOrderDetailAttributes;
}
