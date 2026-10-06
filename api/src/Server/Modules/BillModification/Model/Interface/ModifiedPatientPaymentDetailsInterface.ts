import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ModifiedPatientPaymentDetailsAttributes extends IAttributes {
	Id: number;
	PatientReceiptId: number;
	ReceiptDateTime: Date;
	ReceiptNumber: string;
	ReceiptTypeId: number;
	ReceiptStatusId: number;
	IsPharmacyReceipt: boolean;
	PharmacyReceiptTypeId: number;
	ReceiptGeneratedById: number;
	ReceiptApprovedById: number;
	ModifiedPatientBillId: number;
	PatientBillId: number;
	BillTypeId: number;
	PatientId: number;
	TransferPatientId: number;
	PatientTypeId: number;
	PatientName: string;
	EncounterId: number;
	TransferEncounterId: number;
	FamilyLinkId: number;
	GuarantorId: number;
	GuarantorTypeId: number;
	GuarantorName: string;
	DepartmentId: number;
	FacilityId: number;
	OrganizationId: number;
	AmountPaid: number;
	AmountAdjusted: number;
	TDSAmount: number;
	DisAllowance: number;
	RoundOffValue: number;
	PaymentCounterId: number;
	PaymentTypeId: number;
	PaymentStatusId: number;
	CurrencyTypeId: number;
	IsConsolidatePay: boolean;
	IsClaimed: boolean;
	TerminalNoId: number;
	BankId: number;
	CardTypeId: number;
	CardNumber: string;
	CardExpiryDate: Date;
	CardHolderName: string;
	AuthorizeNumber: number;
	AuthorizedCode: string;
	ChequeNo: string;
	ChequeDate: Date;
	CollectedOn: Date;
	DDNumber: string;
	DDDate: Date;
	WireTransferId: number;
	WireTransferDate: Date;
	Comments: string;
	CancelReason: string;
	Status: number;
	Rev: number;
	CreatedBy: number;
	CreatedAt: Date;
	UpdatedBy: number;
	UpdatedAt: Date;
}

export interface ModifiedPatientPaymentDetailsInstance extends Instance<ModifiedPatientPaymentDetailsAttributes> {
	// I'm exposing every DB column as an instance field to so that tsc won't complain.
	// CreatedAt: Date;
	// UpdatedAt: Date;
	dataValues: ModifiedPatientPaymentDetailsAttributes;
}
