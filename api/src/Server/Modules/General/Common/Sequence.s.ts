import { BoFactory } from '../../Base/Index';
import { SequenceMastersBo } from '../Business/Index';
//import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request, SequenceGenerator } from '../../../Core/Index';
import { SequenceMastersAttributes } from '../Model/Interface/Index';

export const SequenceKeys = {

    //////////////////////////// Facility 1 /////////////////////////////////////////////

    PatientId: 'PatientIdentifier',
    TempPatientId: 'PatientTempIdentifier',
    FamilyPatientId: 'FamilyLinkIdentifier',
    PrescriptionId: 'PrescriptionIdentifier',
    PatientOrderId: 'PatientOrderIdentifier',
    OPBillNumberId: 'OPBillNumberIdentifier',
    OPCreditBillNumberId: 'OPCreditBillNumberIdentifier',
    BarcodeNumberId: 'BarcodeNumberIdentifier',
    ReceiptNrId: 'ReceiptNumberIdentifier',
    IpAdvanceNrId: 'IPAdvanceNumberIdentifier',
    IPReceiptNrId: 'IPReceiptNumberIdentifier',
    RefundNrId: 'RefundIdentifier',
    IPRefundNrId: 'IPRefundIdentifier',
    AdmissionRequest: 'AdmissionRequestIdentifier',
    Admission: 'AdmissionIdentifier',
    InsuranceTempBill: 'InsuranceTempBillIdentifier',
    DayCareAdmission: 'DayCareAdmissionIdentifier',
    OPEncounter: 'OPEncounterIdentifier',
    BedHousekeeping: 'BedHousekeepingIdentifier',
    ServiceRequest: 'TicketNumberIdentifier',
    BedTransportation: 'BedTransportIdentifier',
    BedTransferIdentifier: 'BedTransferIdentifier',
    PatientLISWorkOrder: 'PatientLISWorkOrderIdentifier',
    PatientRISWorkOrder: 'PatientRISWorkOrderIdentifier',
    PatientENDOWorkOrder: 'PatientENDOWorkOrderIdentifier',
    IPBillNumberId: 'IPBillNumberIdentifier',
    AutoJobIPBillNumberId: 'AutoJobIPBillNumberIdentifier',
    OTrequestNoId: 'OTrequestNoIdentifier',
    IPFinalBillNumberId: 'IPFinalBillNumberIdentifier',
    DayCareIPFinalBillNumberId: 'DayCareIPFinalBillNumberIdentifier',
    IPCreditFinalBillNumberId: 'IPCreditFinalBillNumberIdentifier',
    BedOccupancyTranscationId: 'BedOccupancyTranscationIdentifier',
    OTIdentifierId: 'OTIdentifier',
    CreditNoteIdentifier: 'CreditNoteIdentifier',
    MLCNoId: 'MLCNoIdentifier',
    PatientDietOrderId: 'PatientOrderIdentifier',
    DGBillNumberId: 'DGIdentifier',
    MrdRequestId: 'MrdRequestIdentifier',
    MrdIssueId: 'MrdIssueIdentifier',
    AERegistration: 'AERIdentifier',
    DoctorInvoice: 'DoctorInvoice',
    DoctorPayment: 'DoctorPayment',
    CategoryIdentifier: 'CategoryIdentifier',
    ConceptIdentifier: 'ConceptIdentifier',
    InsurancePaymentIdentifier: 'InsurancePaymentIdentifier',
    ClaimNumber: 'ClaimNumber',
    SampleDetailIdentifier: 'SampleDetailIdentifier',
    PatientAMBWorkOrder: 'PatientAMBWorkOrderIdentifier',
    CustomerBillNumberId: 'CustomerBillNumberIdentifier',
    MyExpenseId: 'MyExpenseIdentifier',
    ConsultationId: 'ConsultationIdentifier',
    AppointmentTokenNo: 'AppointmentTokenNo',
    UserBillingCounterNo: 'UserBillingCounterNo',
    PhysiotheraphyId: 'PhysiotherapyIdentifier',
    LensPrescriptionId: 'LensPrescriptionIdentier',
    BloodRequestId: 'BloodRequestIdentier',
    LHRCVoucherId: 'LHRCVoucherIdentifier',
    CustomerBillId: 'CustomerBillNumberIdentifier',
    StaffCreditPaymentId: 'StaffCreditPaymentId',
    VirtualOrderId: 'VirtualOrderIdentifier',
    VirtualBillId: 'VirtualBillIdentifier',
    VirtualPaymentId: 'VirtualPaymentIdentifier',
    GatePassId: 'GatePassNo',
    AssetTransferId: 'AssetTransferNo',
    UserId: 'UserIdentifier',
    MedicineOrderId: 'MedicineOrderIdentifier',
    PatientSickLeaveFormId: 'LeaveFormIdentifier',
    TreatmentPlanId: 'TreatmentPlanIdentifier',

    /* Inventory Sequences Identifiers Started */
    MDOpeningStockId: 'MDOpeningStockEntryIdentifier',
    NMDOpeningStockId: 'NMDOpeningStockEntryIdentifier',
    MDPurchaseRequestId: 'MDPurchaseRequestIdentifier',
    NMDPurchaseRequestId: 'NMDPurchaseRequestIdentifier',
    MDPurchaseOrderId: 'MDPurchaseOrderIdentifier',
    NMDPurchaseOrderId: 'NMDPurchaseOrderIdentifier',
    GeneralPurchaseOrderId: 'GeneralPurchaseOrderIdentifier',
    MDGoodsReceiptNoteId: 'MDGoodsReceiptNoteIdentifier',
    GeneralGoodsReceiptNoteId: 'GeneralGoodsReceiptNoteIdentifier',
    NMDGoodsReceiptNoteId: 'NMDGoodsReceiptNoteIdentifier',
    ConsignmentNoteId: 'ConsignmentNoteIdentifier',
    MDPurchaseReturn: 'MDPurchaseReturnIdentifier',
    NMDPurchaseReturn: 'NMDPurchaseReturnIdentifier',
    MDStockRequest: 'MDStockRequestIdentifier',
    NMDStockRequest: 'NMDStockRequestIdentifier',
    MDStockTransfer: 'MDStockTransferIdentifier',
    NMDStockTransfer: 'NMDStockTransferIdentifier',
    MDStockReceive: 'MDStockReceiveIdentifier',
    NMDStockReceive: 'NMDStockReceiveIdentifier',
    MDStockConsumption: 'MDStockConsumptionIdentifier',
    NMDStockConsumption: 'NMDStockConsumptionIdentifier',
    MDStockAdjustment: 'MDStockAdjustmentIdentifier',
    NMDStockAdjustment: 'NMDStockAdjustmentIdentifier',
    InvWorkorderId: 'InvWorkorderIdentifier',
    ServiceBillEntryId: 'ServiceBillEntryIdentifier',
    OpticalGoodsReceiptNoteId: 'OpticalGoodsReceiptNoteIdentifier',
    OpticalEntryId: 'OpticalEntryIdentifier',
    VendorPaymentId: 'VendorPaymentIdentifier',
    /* Inventory Sequences Identifiers Ended */

    /* Pharmacy Sequences Identifiers Started */
    PharmacyBillNumberId: 'PharmacyBillNumberIdentifier',
    PharmacyDueBillNumberId: 'PharmacyDueBillNumberIdentifier',
    PharmacyIPBillNumberId: 'PharmacyIPBillNumberIdentifier',
    PharmacyReturnNumberId: 'PharmacyReturnNumberIdentifier',
    PatientRequestNumberId: 'PatientRequestNumberIdentifier',
    PatientReturnNumberId: 'PatientReturnNumberIdentifier',
    PatientDispenseNumberId: 'PatientDispenseNumberIdentifier',
    PatientDispenseReturnNumberId: 'PatientDispenseReturnNumberIdentifier',
    GeneralExpenseId: 'GeneralExpenseIdIdentier',
    PharmacyBillClaimNumberId: 'PharmacyBillClaimNumberIdentifier',
    /* Pharmacy Sequences Identifiers Ended */

    /* Store Wise Sequences Started */
    GRNStore: 'GRNStoreIdentifier',
    PharmacyBillStore: 'SaleStoreIdentifier',
    PharmacyReturnStore: 'ReturnStoreIdentifier',
    DispenseStore: 'DispenseStoreIdentifier',
    DispenseReturnStore: 'DispenseReturnStoreIdentifier',
    /* Store Wise Sequences Ended */
    /*Blood Bank Sequence Identifiers*/
    DonorRegistrationId: 'DonorRegPINIdentifier',
    BloodScreeningId: 'BloodScreeningIdentifier',
    BloodDonationId: 'BloodDonationIdentifier',
    BloodRequestionId: 'BloodRequestNoIdentifier',
    BloodCrossMatchId: 'BloodCrossMatchIdentifier',
    BloodExternalIssueId: 'BloodExternalIssueIdentifier',
    /*Blood Bank Sequence Identifiers*/

    /*BioWaste Sequence Identifiers*/
    WasteId: 'TransactionNoIdentifier',
    /*BioWaste Sequence Identifiers*/

    /*Linen&Laundry Sequence Identifiers*/
    LinenTransferId: 'LinenTransferIdentifier',
    LinenStockEntryId: 'LinenStockEntryIdentifier',
    /*Linen&Laundry Sequence Identifiers*/


    BankStatementNumberId: 'BankStatementIdentifier',


    PharmacyCreditBill: 'PharmacyCreditBillIdentifier',
    PharmacyCreditIPBill: 'PharmacyCreditIPBillIdentifier',
    PharmacyCashBill: 'PharmacyCashBillIdentifier',
    PharmacyManualBill: 'PharmacyManualBillIdentifier',

    PharmacyRetCreditBill: 'PharmacyRetCreditBillIdentifier',
    PharmacyRetCashBill: 'PharmacyRetCashBillIdentifier',
    PharmacyRetManualBill: 'PharmacyRetManualBillIdentifier',


    //////////////////////////// Facility 2 /////////////////////////////////////////////

    PatientId2: 'PatientIdentifier2',
    TempPatientId2: 'PatientTempIdentifier2',
    PrescriptionId2: 'PrescriptionIdentifier2',
    PatientOrderId2: 'PatientOrderIdentifier2',
    OPBillNumberId2: 'OPBillNumberIdentifier2',
    BarcodeNumberId2: 'BarcodeNumberIdentifier2',
    ReceiptNrId2: 'ReceiptNumberIdentifier2',
    IpAdvanceNrId2: 'IPAdvanceNumberIdentifier2',
    IPReceiptNrId2: 'IPReceiptNumberIdentifier2',
    RefundNrId2: 'RefundIdentifier2',
    IPRefundNrId2: 'IPRefundIdentifier2',
    AdmissionRequest2: 'AdmissionRequestIdentifier2',
    Admission2: 'AdmissionIdentifier2',
    OPEncounter2: 'OPEncounterIdentifier2',
    BedHousekeeping2: 'BedHousekeepingIdentifier2',
    ServiceRequest2: 'TicketNumberIdentifier2',
    BedTransportation2: 'BedTransportIdentifier2',
    BedTransferIdentifier2: 'BedTransferIdentifier2',
    PatientLISWorkOrder2: 'PatientLISWorkOrderIdentifier2',
    PatientRISWorkOrder2: 'PatientRISWorkOrderIdentifier2',
    PatientENDOWorkOrder2: 'PatientENDOWorkOrderIdentifier2',
    IPBillNumberId2: 'IPBillNumberIdentifier2',
    AutoJobIPBillNumberId2: 'AutoJobIPBillNumberIdentifier2',
    OTrequestNoId2: 'OTrequestNoIdentifier2',
    IPFinalBillNumberId2: 'IPFinalBillNumberIdentifier2',
    IPCreditFinalBillNumberId2: 'IPCreditFinalBillNumberIdentifier2',
    BedOccupancyTranscationId2: 'BedOccupancyTranscationIdentifier2',
    OTIdentifierId2: 'OTIdentifier2',
    CreditNoteIdentifier2: 'CreditNoteIdentifier2',
    MLCNoId2: 'MLCNoIdentifier2',
    PatientDietOrderId2: 'PatientOrderIdentifier2',
    DGBillNumberId2: 'DGIdentifier2',
    MrdRequestId2: 'MrdRequestIdentifier2',
    MrdIssueId2: 'MrdIssueIdentifier2',
    AERegistration2: 'AERIdentifier2',
    DoctorInvoice2: 'DoctorInvoice2',
    DoctorPayment2: 'DoctorPayment2',
    CategoryIdentifier2: 'CategoryIdentifier2',
    ConceptIdentifier2: 'ConceptIdentifier2',
    InsurancePaymentIdentifier2: 'InsurancePaymentIdentifier2',
    ClaimNumber2: 'ClaimNumber2',
    SampleDetailIdentifier2: 'SampleDetailIdentifier2',
    PatientAMBWorkOrder2: 'PatientAMBWorkOrderIdentifier2',
    CustomerBillNumberId2: 'CustomerBillNumberIdentifier2',
    AppointmentTokenNo2: 'AppointmentTokenNo2',
    UserBillingCounterNo2: 'UserBillingCounterNo2',
    PhysiotheraphyId2: 'PhysiotherapyIdentifier2',
    LensPrescriptionId2: 'LensPrescriptionIdentier2',
    BloodRequestId2: 'BloodRequestIdentier2',
    GeneralExpenseId2: 'GeneralExpenseIdIdentier2',
    CustomerBillId2: 'CustomerBillNumberIdentifier2',


    /* Inventory Sequences Identifiers Started */
    MDOpeningStockId2: 'MDOpeningStockEntryIdentifier2',
    NMDOpeningStockId2: 'NMDOpeningStockEntryIdentifier2',
    MDPurchaseRequestId2: 'MDPurchaseRequestIdentifier2',
    NMDPurchaseRequestId2: 'NMDPurchaseRequestIdentifier2',
    MDPurchaseOrderId2: 'MDPurchaseOrderIdentifier2',
    NMDPurchaseOrderId2: 'NMDPurchaseOrderIdentifier2',
    GeneralPurchaseOrderId2: 'GeneralPurchaseOrderIdentifier2',
    MDGoodsReceiptNoteId2: 'MDGoodsReceiptNoteIdentifier2',
    NMDGoodsReceiptNoteId2: 'NMDGoodsReceiptNoteIdentifier2',
    ConsignmentNoteId2: 'ConsignmentNoteIdentifier2',
    MDPurchaseReturn2: 'MDPurchaseReturnIdentifier2',
    NMDPurchaseReturn2: 'NMDPurchaseReturnIdentifier2',
    MDStockRequest2: 'MDStockRequestIdentifier2',
    NMDStockRequest2: 'NMDStockRequestIdentifier2',
    MDStockTransfer2: 'MDStockTransferIdentifier2',
    NMDStockTransfer2: 'NMDStockTransferIdentifier2',
    MDStockReceive2: 'MDStockReceiveIdentifier2',
    NMDStockReceive2: 'NMDStockReceiveIdentifier2',
    MDStockConsumption2: 'MDStockConsumptionIdentifier2',
    NMDStockConsumption2: 'NMDStockConsumptionIdentifier2',
    MDStockAdjustment2: 'MDStockAdjustmentIdentifier2',
    NMDStockAdjustment2: 'NMDStockAdjustmentIdentifier2',
    InvWorkorderId2: 'InvWorkorderIdentifier2',
    ServiceBillEntryId2: 'ServiceBillEntryIdentifier2',
    /* Inventory Sequences Identifiers Ended */

    /* Pharmacy Sequences Identifiers Started */
    PharmacyBillNumberId2: 'PharmacyBillNumberIdentifier2',
    PharmacyDueBillNumberId2: 'PharmacyDueBillNumberIdentifier2',
    PharmacyReturnNumberId2: 'PharmacyReturnNumberIdentifier2',
    PatientRequestNumberId2: 'PatientRequestNumberIdentifier2',
    PatientReturnNumberId2: 'PatientReturnNumberIdentifier2',
    PatientDispenseNumberId2: 'PatientDispenseNumberIdentifier2',
    PatientDispenseReturnNumberId2: 'PatientDispenseReturnNumberIdentifier2',
    /* Pharmacy Sequences Identifiers Ended */

    /*Blood Bank Sequence Identifiers*/
    DonorRegistrationId2: 'DonorRegPINIdentifier2',
    BloodScreeningId2: 'BloodScreeningIdentifier2',
    BloodDonationId2: 'BloodDonationIdentifier2',
    /*Blood Bank Sequence Identifiers*/

    /*BioWaste Sequence Identifiers*/
    WasteId2: 'TransactionNoIdentifier2',
    /*BioWaste Sequence Identifiers*/

    /*Linen&Laundry Sequence Identifiers*/
    LinenTransferId2: 'LinenTransferIdentifier2',
    LinenStockEntryId2: 'LinenStockEntryIdentifier2',
    /*Linen&Laundry Sequence Identifiers*/

    BankStatementNumberId2: 'BankStatementIdentifier2',

    //////////////////////////// Facility 4 /////////////////////////////////////////////

    PatientId4: 'PatientIdentifier4',
    TempPatientId4: 'PatientTempIdentifier4',
    PrescriptionId4: 'PrescriptionIdentifier4',
    PatientOrderId4: 'PatientOrderIdentifier4',
    OPBillNumberId4: 'OPBillNumberIdentifier4',
    BarcodeNumberId4: 'BarcodeNumberIdentifier4',
    ReceiptNrId4: 'ReceiptNumberIdentifier4',
    IpAdvanceNrId4: 'IPAdvanceNumberIdentifier4',
    IPReceiptNrId4: 'IPReceiptNumberIdentifier4',
    RefundNrId4: 'RefundIdentifier4',
    IPRefundNrId4: 'IPRefundIdentifier4',
    AdmissionRequest4: 'AdmissionRequestIdentifier4',
    Admission4: 'AdmissionIdentifier4',
    OPEncounter4: 'OPEncounterIdentifier4',
    BedHousekeeping4: 'BedHousekeepingIdentifier4',
    ServiceRequest4: 'TicketNumberIdentifier4',
    BedTransportation4: 'BedTransportIdentifier4',
    BedTransferIdentifier4: 'BedTransferIdentifier4',
    PatientLISWorkOrder4: 'PatientLISWorkOrderIdentifier4',
    PatientRISWorkOrder4: 'PatientRISWorkOrderIdentifier4',
    PatientENDOWorkOrder4: 'PatientENDOWorkOrderIdentifier4',
    IPBillNumberId4: 'IPBillNumberIdentifier4',
    AutoJobIPBillNumberId4: 'AutoJobIPBillNumberIdentifier4',
    OTrequestNoId4: 'OTrequestNoIdentifier4',
    IPFinalBillNumberId4: 'IPFinalBillNumberIdentifier4',
    IPCreditFinalBillNumberId4: 'IPCreditFinalBillNumberIdentifier4',
    BedOccupancyTranscationId4: 'BedOccupancyTranscationIdentifier4',
    OTIdentifierId4: 'OTIdentifier4',
    CreditNoteIdentifier4: 'CreditNoteIdentifier4',
    MLCNoId4: 'MLCNoIdentifier4',
    PatientDietOrderId4: 'PatientOrderIdentifier4',
    DGBillNumberId4: 'DGIdentifier4',
    MrdRequestId4: 'MrdRequestIdentifier4',
    MrdIssueId4: 'MrdIssueIdentifier4',
    AERegistration4: 'AERIdentifier4',
    DoctorInvoice4: 'DoctorInvoice4',
    DoctorPayment4: 'DoctorPayment4',
    CategoryIdentifier4: 'CategoryIdentifier4',
    ConceptIdentifier4: 'ConceptIdentifier4',
    InsurancePaymentIdentifier4: 'InsurancePaymentIdentifier4',
    ClaimNumber4: 'ClaimNumber4',
    SampleDetailIdentifier4: 'SampleDetailIdentifier4',
    PatientAMBWorkOrder4: 'PatientAMBWorkOrderIdentifier4',
    CustomerBillNumberId4: 'CustomerBillNumberIdentifier4',
    AppointmentTokenNo4: 'AppointmentTokenNo4',
    UserBillingCounterNo4: 'UserBillingCounterNo4',
    PhysiotheraphyId4: 'PhysiotherapyIdentifier4',
    LensPrescriptionId4: 'LensPrescriptionIdentier4',
    BloodRequestId4: 'BloodRequestIdentier4',
    GeneralExpenseId4: 'GeneralExpenseIdIdentier4',
    CustomerBillId4: 'CustomerBillNumberIdentifier4',


    /* Inventory Sequences Identifiers Started */
    MDOpeningStockId4: 'MDOpeningStockEntryIdentifier4',
    NMDOpeningStockId4: 'NMDOpeningStockEntryIdentifier4',
    MDPurchaseRequestId4: 'MDPurchaseRequestIdentifier4',
    NMDPurchaseRequestId4: 'NMDPurchaseRequestIdentifier4',
    MDPurchaseOrderId4: 'MDPurchaseOrderIdentifier4',
    NMDPurchaseOrderId4: 'NMDPurchaseOrderIdentifier4',
    GeneralPurchaseOrderId4: 'GeneralPurchaseOrderIdentifier4',
    MDGoodsReceiptNoteId4: 'MDGoodsReceiptNoteIdentifier4',
    NMDGoodsReceiptNoteId4: 'NMDGoodsReceiptNoteIdentifier4',
    MDPurchaseReturn4: 'MDPurchaseReturnIdentifier4',
    NMDPurchaseReturn4: 'NMDPurchaseReturnIdentifier4',
    MDStockRequest4: 'MDStockRequestIdentifier4',
    NMDStockRequest4: 'NMDStockRequestIdentifier4',
    MDStockTransfer4: 'MDStockTransferIdentifier4',
    NMDStockTransfer4: 'NMDStockTransferIdentifier4',
    MDStockReceive4: 'MDStockReceiveIdentifier4',
    NMDStockReceive4: 'NMDStockReceiveIdentifier4',
    MDStockConsumption4: 'MDStockConsumptionIdentifier4',
    NMDStockConsumption4: 'NMDStockConsumptionIdentifier4',
    MDStockAdjustment4: 'MDStockAdjustmentIdentifier4',
    NMDStockAdjustment4: 'NMDStockAdjustmentIdentifier4',
    InvWorkorderId4: 'InvWorkorderIdentifier4',
    ServiceBillEntryId4: 'ServiceBillEntryIdentifier4',
    /* Inventory Sequences Identifiers Ended */

    /* Pharmacy Sequences Identifiers Started */
    PharmacyBillNumberId4: 'PharmacyBillNumberIdentifier4',
    PharmacyDueBillNumberId4: 'PharmacyDueBillNumberIdentifier4',
    PharmacyReturnNumberId4: 'PharmacyReturnNumberIdentifier4',
    PatientRequestNumberId4: 'PatientRequestNumberIdentifier4',
    PatientReturnNumberId4: 'PatientReturnNumberIdentifier4',
    PatientDispenseNumberId4: 'PatientDispenseNumberIdentifier4',
    PatientDispenseReturnNumberId4: 'PatientDispenseReturnNumberIdentifier4',
    /* Pharmacy Sequences Identifiers Ended */

    /*Blood Bank Sequence Identifiers*/
    DonorRegistrationId4: 'DonorRegPINIdentifier4',
    BloodScreeningId4: 'BloodScreeningIdentifier4',
    BloodDonationId4: 'BloodDonationIdentifier4',
    /*Blood Bank Sequence Identifiers*/

    /*BioWaste Sequence Identifiers*/
    WasteId4: 'TransactionNoIdentifier4',
    /*BioWaste Sequence Identifiers*/

    /*Linen&Laundry Sequence Identifiers*/
    LinenTransferId4: 'LinenTransferIdentifier4',
    LinenStockEntryId4: 'LinenStockEntryIdentifier4',
    /*Linen&Laundry Sequence Identifiers*/

    BankStatementNumberId4: 'BankStatementIdentifier4',

    /*Store Sequence*/
    /* Pharmacy Sequences Identifiers Started */
    PharmacyBillNumberId_S1: 'PharmacyBillNumberIdentifierS-1',
    PharmacyReturnNumberId_S1: 'PharmacyReturnNumberIdentifierS-1',
    // PharmacyDueBillNumberId4: 'PharmacyDueBillNumberIdentifier4',
    // PharmacyReturnNumberId4: 'PharmacyReturnNumberIdentifier4',
    // PatientRequestNumberId4: 'PatientRequestNumberIdentifier4',
    // PatientReturnNumberId4: 'PatientReturnNumberIdentifier4',
    // PatientDispenseNumberId4: 'PatientDispenseNumberIdentifier4',
    // PatientDispenseReturnNumberId4: 'PatientDispenseReturnNumberIdentifier4',
    /* Pharmacy Sequences Identifiers Ended */
    /*End*/
};

export class Sequence {
    private static SequenceMastersBo = BoFactory.GetBo(SequenceMastersBo);
    // private static IsInitialized = false;
    private static Data: Array<SequenceMastersAttributes>;
    public static async Init(): Promise<void> {
        let PageContext = {
            PageSize: -1,
            PageNumber: 1
        };
        let res = await Sequence.SequenceMastersBo.GetSequenceMasterss({
            Id: null,
            Attributes: null, PageContext: PageContext, Params: []
        });
        Sequence.Data = res.Data || [];
        // this.Data.forEach(async (x) => {
        //     let value = await SequenceGenerator.GetSequence(x.SeqName);
        //     if (value < x.SeqStartId) {
        //         await SequenceGenerator.SetSequence(x.SeqName, x.SeqStartId);
        //     }
        // });
        //starts
        await Promise.all(Sequence.Data.map((seqItem): Promise<void> => {
            return (async (si): Promise<void> => {
                let value = await SequenceGenerator.GetSequence(si.SeqName);
                let updateRedisValue = value < si.SeqStartId;
                if (updateRedisValue) {
                    await SequenceGenerator.SetSequence(si.SeqName, si.SeqStartId);
                }
                console.log(['Sequence Gen',
                    ' Name:', si.SeqName,
                    ' CurrentDB:', si.SeqStartId,
                    ' CurrentRedis:', value,
                    ' UpdateRedis:', updateRedisValue
                ].join(' '));
            })(seqItem);
        }));
        //ends
        // Sequence.IsInitialized = true;
    }

    /*Done by Jothi*/
    // public static async Next(key: string): Promise<string> {
    //     let sequences = Sequence.Data.filter(x => x.SeqName === key);
    //     if (!sequences || sequences.length < 1) { throw 'Given Key is not available in Sequence Master' + key; }
    //     let sequence = sequences[0];
    //     return await SequenceGenerator.Next({
    //         key: sequence.SeqName,
    //         prefix: sequence.SeqPrefix, suffix: sequence.SeqSuffix,
    //         isdailyreset: sequence.IsDailyReset,
    //         seqbaseid: sequence.SeqBaseId
    //     });
    // }

    // public static async Next(key: string, facilityId?: number): Promise<string> {
    //     let identifierKey = key;
    //     console.log('&&&&&&&&&&&&&&&&&');
    //     console.log(facilityId);
    //     if (facilityId && facilityId > 1)
    //         identifierKey += facilityId;
    //     console.log('Identifier Key');
    //     console.log(identifierKey);
    //     let sequences = Sequence.Data.filter(x => x.SeqName === identifierKey);
    //     if (!sequences || sequences.length < 1) { throw 'Given Key is not available in Sequence Master ' + key; }
    //     let sequence = sequences[0];
    //     console.log(sequence);
    //     return await SequenceGenerator.Next({
    //         key: sequence.SeqName,
    //         prefix: sequence.SeqPrefix, suffix: sequence.SeqSuffix,
    //         isdailyreset: sequence.IsDailyReset,
    //         seqbaseid: sequence.SeqBaseId
    //     });
    // }

    public static async Next(key: string, propertyName?: string, facilityId?: number): Promise<string> {
        // const seqGenBO = BoFactory.GetBo(SequenceGenerator);
        // private static SequenceMastersBo = BoFactory.GetBo(SequenceMastersBo);
        let identifierKey = key;
        console.log('&&&&&&&&&&&&&&&&&');
        console.log(facilityId);
        if (facilityId && facilityId > 1)
            identifierKey += facilityId;
        console.log('*********Identifier Key*****');
        console.log(identifierKey);
        let sequences = Sequence.Data.filter(x => x.SeqName === identifierKey);
        if (!sequences || sequences.length < 1) { throw 'Given Key is not available in Sequence Master ' + key; }
        let sequence = sequences[0];
        console.log(sequence);

        let finalBillIdentifiers: any = ['DayCareIPFinalBillNumberIdentifier', 'IPFinalBillNumberIdentifier',
             'IPCreditFinalBillNumberIdentifier'
        ];

        let redisValue: number = 0;
        let clientCode = process.env.CLIENT_CODE || '';
        if ((clientCode.toLowerCase() === 'jsshospital') && finalBillIdentifiers.includes(sequence.SeqName)) {
            try {
                redisValue = await SequenceGenerator.GetSequence(sequence.SeqName);
            } catch (err) {
                console.error('[Redis] Failed to fetch sequence for ' + sequence.SeqName + ': ', err);
                throw 'Redis Failed to fetch ' + key;
                // redisValue = 0; // fallback to 0 if Redis fails
            }

            let maxSeq: number = 0;
            try {
                maxSeq = await Sequence.SequenceMastersBo.getMaxSequenceFromTable(sequence);
            } catch (err) {
                console.error('Cannot fetch max for ' + sequence.TableName + ': ', err);
                throw 'Given sequence is not available in Sequence Table ' + sequence.TableName;
                // redisValue = 0; // fallback to 0 if Redis fails
            }
            console.log('Max sequence:', maxSeq);
            console.log('Max Redis Value:', redisValue);

            if (maxSeq !== redisValue) {
                try {
                    await SequenceGenerator.SetSequence(sequence.SeqName, Number(maxSeq));
                } catch (err) {
                    console.error('Cannot Set max for ' + sequence.SeqName + ': ', err);
                    throw 'Cannot Set max for  ' + sequence.SeqName;
                }
            }
        }

        try {
            return await SequenceGenerator.Next({
                key: sequence.SeqName,
                prefix: sequence.SeqPrefix, suffix: sequence.SeqSuffix,
                isdailyreset: sequence.IsDailyReset,
                seqbaseid: sequence.SeqBaseId
            });
        } catch (err) {
            console.error('[Format] Failed to generate formatted sequence ', err);
            throw new Error('Failed to generate final sequence.');
        }
    }

    /*Done by Jothi*/
    // public static async ProcessDeferredSequences(request: Request): Promise<any> {
    //     if (request.transaction
    //         && request.transaction.finished !== 'rollback'
    //         && request.deferredSequences) {
    //         try {
    //             for (let i = 0, lenaftenv = request.deferredSequences.length; i < lenaftenv; i++) {
    //                 let dsi = request.deferredSequences[i];
    //                 const code = await Sequence.Next(dsi.key);
    //                 await dsi.bo.Update({ [dsi.propertyName]: code }, { where: { Id: dsi.id } });
    //                 if (dsi && dsi.afterEvents &&
    //                     dsi.afterEvents.length) {
    //                     for (let k = 0, lenaftenv1 = dsi.afterEvents.length; k < lenaftenv1; k++) {
    //                         let evtFn: any = null;
    //                         try {
    //                             evtFn = dsi.afterEvents[k];
    //                             await evtFn(code);
    //                         } catch (ex) {
    //                             console.log('Error : ProcessDeferredSequences - evtFn : ' + ex);
    //                             if (evtFn && evtFn.name) {
    //                                 console.error(['Error occured', evtFn.name, code, 'exception', ex.toString()].join(' '));
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         } catch (ex) {
    //             console.error('Error : ProcessDeferredSequences : ' + ex);
    //         }

    //         // await Promise.all(request.deferredSequences.map(sequenceItem => {
    //         //     return (async (dsi) => {
    //         //         const code = await Sequence.Next(dsi.key);
    //         //         await dsi.bo.Update({ [dsi.propertyName]: code }, { where: { Id: dsi.id } });
    //         //         if (dsi.afterEvents && dsi.afterEvents.length) {
    //         //             await Promise.all(dsi.afterEvents.map(evt => {
    //         //                 return (async (evtFn, cd) => {
    //         //                     try {
    //         //                         await evtFn(cd);
    //         //                     } catch (ex) {
    //         //                         console.log(['Error occured', evtFn.name, cd, 'exception', ex.toString()].join(' '));
    //         //                     }
    //         //                 })(evt, code);
    //         //             }));
    //         //         }
    //         //     })(sequenceItem);
    //         // }));
    //         request.deferredSequences = null;
    //     }
    //     return true;
    // }

    public static async ProcessDeferredSequences(request: Request): Promise<any> {
        if (
            request.transaction &&
            request.transaction.finished !== 'rollback' &&
            request.deferredSequences
        ) {
            try {
                for (const dsi of request.deferredSequences) {
                    try {
                        const code = await Sequence.Next(dsi.key);
                        // Update the business object with the generated code
                        await dsi.bo.Update(
                            { Id: dsi.id, [dsi.propertyName]: code } as any,
                            { where: { Id: dsi.id } }
                        );

                        // Process after-events, if any
                        if (Array.isArray(dsi.afterEvents) && dsi.afterEvents.length > 0) {
                            for (const evtFn of dsi.afterEvents) {
                                try {
                                    if (typeof evtFn === 'function') {
                                        await evtFn(code);
                                    } else {
                                        console.warn('Skipped non-function afterEvent:', evtFn);
                                    }
                                } catch (evtError) {
                                    console.error(
                                        'Error in afterEvent',
                                        evtError
                                    );
                                }
                            }
                        }
                    } catch (dsiError) {
                        throw new Error('processing deferred sequence:' + dsiError);
                        // console.error(
                        //     'Error processing deferred sequence:',
                        //     dsiError
                        // );
                    }
                }
            } catch (ex) {
                console.log('Error in ProcessDeferredSequences:', ex);
                // throw new Error('Error Processing in Identifier');
                throw new Error('Error Processing in Identifierr: ' + request.deferredSequences[0].key);
            } finally {
                // Reset deferredSequences to avoid reprocessing
                request.deferredSequences = null;
            }
        }
        return true;
    }
}
