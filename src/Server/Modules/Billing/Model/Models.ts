import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        PatientBills: SequelizeStatic.Model<i.PatientBillsInstance, i.PatientBillsAttributes>;
        PatientBillDetails: SequelizeStatic.Model<i.PatientBillDetailsInstance, i.PatientBillDetailsAttributes>;
        PatientPaymentDetails: SequelizeStatic.Model<i.PatientPaymentDetailsInstance, i.PatientPaymentDetailsAttributes>;
        PatientRefund: SequelizeStatic.Model<i.PatientRefundInstance, i.PatientRefundAttributes>;
        PatientRefundDetails: SequelizeStatic.Model<i.PatientRefundDetailsInstance, i.PatientRefundDetailsAttributes>;
        PatientBillSplitDetails: SequelizeStatic.Model<i.PatientBillSplitDetailsInstance, i.PatientBillSplitDetailsAttributes>;
        PatientCreditNote: SequelizeStatic.Model<i.PatientCreditNoteInstance, i.PatientCreditNoteAttributes>;
        PatientCreditNoteDetails: SequelizeStatic.Model<i.PatientCreditNoteDetailsInstance, i.PatientCreditNoteDetailsAttributes>;
        PatientBillSummary: SequelizeStatic.Model<i.PatientBillSummaryInstance, i.PatientBillSummaryAttributes>;
        PatientBillLock: SequelizeStatic.Model<i.PatientBillLockInstance, i.PatientBillLockAttributes>;
        PatientReturns: SequelizeStatic.Model<i.PatientReturnsInstance, i.PatientReturnsAttributes>;
        PatientReturnDetails: SequelizeStatic.Model<i.PatientReturnDetailsInstance, i.PatientReturnDetailsAttributes>;
        InsurancePayment: SequelizeStatic.Model<i.InsurancePaymentInstance, i.InsurancePaymentAttributes>;
        InsurancePaymentDetails: SequelizeStatic.Model<i.InsurancePaymentDetailsInstance, i.InsurancePaymentDetailsAttributes>;
        PatientDispense: SequelizeStatic.Model<i.PatientDispenseInstance, i.PatientDispenseAttributes>;
        PatientDispenseDetails: SequelizeStatic.Model<i.PatientDispenseDetailsInstance, i.PatientDispenseDetailsAttributes>;
        PatientDispenseReturn: SequelizeStatic.Model<i.PatientDispenseReturnInstance, i.PatientDispenseReturnAttributes>;
        PatientDispenseReturnDetails: SequelizeStatic.Model<i.PatientDispenseReturnDetailsInstance,
        i.PatientDispenseReturnDetailsAttributes>;
        ClaimSubmission: SequelizeStatic.Model<i.ClaimSubmissionInstance, i.ClaimSubmissionAttributes>;
        ClaimSubmissionDetails: SequelizeStatic.Model<i.ClaimSubmissionDetailsInstance, i.ClaimSubmissionDetailsAttributes>;
        PatientInsuranceChecklist: SequelizeStatic.Model<i.PatientInsuranceChecklistInstance, i.PatientInsuranceChecklistAttributes>;
        PatientAccounts: SequelizeStatic.Model<i.PatientAccountsInstance, i.PatientAccountsAttributes>;
        PatientPaymentAdjustments: SequelizeStatic.Model<i.PatientPaymentAdjustmentsInstance, i.PatientPaymentAdjustmentsAttributes>;
        CustomerBills: SequelizeStatic.Model<i.CustomerBillsInstance, i.CustomerBillsAttributes>;
        CustomerBillDetails: SequelizeStatic.Model<i.CustomerBillDetailsInstance, i.CustomerBillDetailsAttributes>;
        UserBillingCounters: SequelizeStatic.Model<i.UserBillingCountersInstance, i.UserBillingCountersAttributes>;
        UserBillingCounterDenominations: SequelizeStatic.Model<i.UserBillingCounterDenominationsInstance,
        i.UserBillingCounterDenominationsAttributes>;
        UserBillingCounterCancellations: SequelizeStatic.Model<i.UserBillingCounterCancellationsInstance,
        i.UserBillingCounterCancellationsAttributes>;
        PatientBillPackageSummary: SequelizeStatic.Model<i.PatientBillPackageSummaryInstance,
        i.PatientBillPackageSummaryAttributes>;
        GeneralExpenses: SequelizeStatic.Model<i.GeneralExpensesInstance, i.GeneralExpensesAttributes>;
        OPModifyPatBills: SequelizeStatic.Model<i.OPModifyPatBillsInstance, i.OPModifyPatBillsAttributes>;
        OPModifyPatBillDetails: SequelizeStatic.Model<i.OPModifyPatBillDetailsInstance, i.OPModifyPatBillDetailsAttributes>;
        OPModifyPatPaymentDetails: SequelizeStatic.Model<i.OPModifyPatPaymentDetailsInstance, i.OPModifyPatPaymentDetailsAttributes>;
        PatientExecutableProcedure: SequelizeStatic.Model<i.PatientExecutableProcedureInstance, i.PatientExecutableProcedureAttributes>;
        BankStatements: SequelizeStatic.Model<i.BankStatementsInstance, i.BankStatementsAttributes>;
        BankStatementDetails: SequelizeStatic.Model<i.BankStatementDetailsInstance,
        i.BankStatementDetailsAttributes>;
        BankStatementDenominations: SequelizeStatic.Model<i.BankStatementDenominationsInstance,
        i.BankStatementDenominationsAttributes>;
        BankStatementCancellations: SequelizeStatic.Model<i.BankStatementCancellationsInstance,
        i.BankStatementCancellationsAttributes>;
        LHRCVoucher: SequelizeStatic.Model<i.LHRCVoucherInstance, i.LHRCVoucherAttributes>;
        LHRCVoucherDetail: SequelizeStatic.Model<i.LHRCVoucherDetailInstance, i.LHRCVoucherDetailAttributes>;
        DoctorShare: SequelizeStatic.Model<i.DoctorShareInstance, i.DoctorShareAttributes>;
        DoctorShareDetails: SequelizeStatic.Model<i.DoctorShareDetailsInstance, i.DoctorShareDetailsAttributes>;
        StaffCreditPayment: SequelizeStatic.Model<i.StaffCreditPaymentInstance, i.StaffCreditPaymentAttributes>;
        StaffCreditPaymentDetails: SequelizeStatic.Model<i.StaffCreditPaymentDetailsInstance, i.StaffCreditPaymentDetailsAttributes>;
        PharmacyModifyPatBillDetails: SequelizeStatic.Model<i.PharmacyModifyPatBillDetailsInstance,
        i.PharmacyModifyPatBillDetailsAttributes>;
        PharmacyModifyPatBills: SequelizeStatic.Model<i.PharmacyModifyPatBillsInstance,
        i.PharmacyModifyPatBillsAttributes>;
        PharmacyModifyPatPaymentDetails: SequelizeStatic.Model<i.PharmacyModifyPatPaymentDetailsInstance,
        i.PharmacyModifyPatPaymentDetailsAttributes>;
        GstReport: SequelizeStatic.Model<i.GstReportInstance, i.GstReportAttributes>;
        PromotionalScheme: SequelizeStatic.Model<i.PromotionalSchemeInstance, i.PromotionalSchemeAttributes>;
        PromotionalSchemeDetail: SequelizeStatic.Model<i.PromotionalSchemeDetailInstance, i.PromotionalSchemeDetailAttributes>;
        PrivilegeCard: SequelizeStatic.Model<i.PrivilegeCardInstance, i.PrivilegeCardAttributes>;
        PrivilegeCardDetail: SequelizeStatic.Model<i.PrivilegeCardDetailInstance, i.PrivilegeCardDetailAttributes>;
        PatientDoctorShareDetails: SequelizeStatic.Model<i.PatientDoctorShareDetailsInstance, i.PatientDoctorShareDetailsAttributes>;
        CollectionBaseRevenue: SequelizeStatic.Model<i.CollectionBaseRevenueInstance, i.CollectionBaseRevenueAttributes>;
        BillingRequest: SequelizeStatic.Model<i.BillingRequestInstance, i.BillingRequestAttributes>;
        DoctorShareTds: SequelizeStatic.Model<i.DoctorShareTdsInstance, i.DoctorShareTdsAttributes>;
        ClaimCoveringletter: SequelizeStatic.Model<i.ClaimCoveringletterInstance, i.ClaimCoveringletterAttributes>;
        ClaimCoveringletterDetails: SequelizeStatic.Model<i.ClaimCoveringletterDetailsInstance, i.ClaimCoveringletterDetailsAttributes>;
        CollectionReport: SequelizeStatic.Model<i.CollectionReportInstance, i.CollectionReportAttributes>;
        CategoryRevenue: SequelizeStatic.Model<i.CategoryRevenueInstance, i.CategoryRevenueAttributes>;
        Revenue: SequelizeStatic.Model<i.RevenueInstance, i.RevenueAttributes>;
        OPStatistics: SequelizeStatic.Model<i.OPStatisticsInstance, i.OPStatisticsAttributes>;
        PosLog: SequelizeStatic.Model<i.PosLogInstance, i.PosLogAttributes>;
        DynamicQRLog: SequelizeStatic.Model<i.DynamicQRLogInstance, i.DynamicQRLogAttributes>;
        PosMomentLog: SequelizeStatic.Model<i.PosMomentLogInstance, i.PosMomentLogAttributes>;
    }
}
