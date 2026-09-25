// Import React and standard Vite entry stuff
import React from 'react';

// Import our custom bridge & API Service for AngularJS & React
import './reactBridge';
import './services/apiService';

// Import Pilot Component
import { PilotComponent } from './react-components/PilotComponent';

// Import DefaultRegistrationScreen Component
import { DefaultRegistrationScreen } from './react-components/DefaultRegistrationScreen';

// Import RegisteredPatientsScreen Component
import { RegisteredPatientsScreen } from './react-components/RegisteredPatientsScreen';

// Import PatientRegistrationSelfScreen Component
import { PatientRegistrationSelfScreen } from './react-components/PatientRegistrationSelfScreen';

// Import NewRegistrationScreen Component
import { NewRegistrationScreen } from './react-components/NewRegistrationScreen';

// Import PatientRegistrationFormScreen Component
import { PatientRegistrationFormScreen } from './react-components/PatientRegistrationFormScreen';

// Import QuickRegistrationFormScreen Component
import { QuickRegistrationFormScreen } from './react-components/QuickRegistrationFormScreen';

// Import FullRegistration Components
import { FullRegistrationPatientOptions, FullRegistrationScreen, FullRegistrationFooter } from './react-components/FullRegistrationScreen';

// Import RegistrationCumVisit Components
import { RegistrationCumVisitScreen, RegistrationCumVisitFooter } from './react-components/RegistrationCumVisitScreen';

// Import PatientIdentityList Component
import { PatientIdentityListScreen } from './react-components/PatientIdentityListScreen';

// Import PatientKinList Component
import { PatientKinListScreen } from './react-components/PatientKinListScreen';

// Import FamilyLink Components
import { FamilyLinkActionBar, FamilyLinkFooter } from './react-components/FamilyLinkScreen';

// Import PatientGuarantorList Component
import { PatientGuarantorListScreen } from './react-components/PatientGuarantorListScreen';

// Import PatientKinFormScreen Component
import { PatientKinFormScreen } from './react-components/PatientKinFormScreen';
// Import PatientPrintsScreen Component
import { PatientPrintsScreen } from './react-components/PatientPrintsScreen';
// Import PatientIdentityFormScreen Component
import { PatientIdentityFormScreen } from './react-components/PatientIdentityFormScreen';
// Import FullRegistrationTabScreen Component
import { FullRegistrationTabScreen } from './react-components/FullRegistrationTabScreen';
// Import CurrentInpatientScreen Component
import { CurrentInpatientScreen } from './react-components/CurrentInpatientScreen';

// Import PatientGuarantorGLFormScreen Component
import { PatientGuarantorGLFormScreen } from './react-components/PatientGuarantorGLFormScreen';

// Import PatientIdDocumentsScreen Component
import { PatientIdDocumentsScreen } from './react-components/PatientIdDocumentsScreen';

// Import PatientDemographicUpdateScreen Component
import { PatientDemographicUpdateScreen } from './react-components/PatientDemographicUpdateScreen';

// Import DeathRecordFormScreen Components (patientdeathrecord-form + quickregistration's deceased-form)
import { PatientDeathRecordFormScreen, DeceasedFormScreen } from './react-components/DeathRecordFormScreen';

// Import DeactivateRemarksScreen Component
import { DeactivateRemarksScreen } from './react-components/DeactivateRemarksScreen';
import { BillingRemarksScreen } from './react-components/BillingRemarksScreen';
// Import AppointmentsTabScreen Component
import { AppointmentsTabScreen } from './react-components/AppointmentsTabScreen';
// Import AppointmentHistoryModal Component (shared by appointment-history.js and view-history.js)
import { AppointmentHistoryModal } from './react-components/AppointmentHistoryModal';
// Import PreviousAppointmentModal Component
import { PreviousAppointmentModal } from './react-components/PreviousAppointmentModal';
// Import DischargedPatientsScreen Component
import { DischargedPatientsScreen } from './react-components/DischargedPatientsScreen';

// Import InpatientTabScreen Component
import { InpatientTabScreen } from './react-components/InpatientTabScreen';

// Import OpdBillScreen Component
import { OpdBillScreen } from './react-components/OpdBillScreen';

// Import VisitCreateFormScreen Components (visitcreateform.js/.html --
// six mounts sharing one reactProps/handleReactAction; see the disclosure
// comment at the top of VisitCreateFormScreen.tsx)
import {
  VisitCreateFormPatientHeader,
  VisitCreateFormTopFields,
  VisitCreateFormMidFields,
  VisitCreateFormLowerFields,
  VisitCreateFormBillingSection,
  VisitCreateFormFooter,
} from './react-components/VisitCreateFormScreen';

// Import EncounterGuarantorListScreen Component
import { EncounterGuarantorListScreen } from './react-components/EncounterGuarantorListScreen';

// Import EncounterGuarantorUpdateFormScreen Component
import { EncounterGuarantorUpdateFormScreen } from './react-components/EncounterGuarantorUpdateFormScreen';

// Import EncounterGuarantorGLFormScreen Component
import { EncounterGuarantorGLFormScreen } from './react-components/EncounterGuarantorGLFormScreen';

// Import AllInpatientListScreen Component
import { AllInpatientListScreen } from './react-components/AllInpatientListScreen';

// Import MyInpatientListScreen Component
import { MyInpatientListScreen } from './react-components/MyInpatientListScreen';

// Import PatientDischargeListScreen Component
import { PatientDischargeListScreen } from './react-components/PatientDischargeListScreen';

// Import PendingDischargesScreen Component
import { PendingDischargesScreen } from './react-components/PendingDischargesScreen';

// Import CurrentInpatientListScreen Component
import { CurrentInpatientListScreen } from './react-components/CurrentInpatientListScreen';

// Import OppatientTabScreen Component
import { OppatientTabScreen } from './react-components/OppatientTabScreen';

// Import MyOPPatientListScreen Component
import { MyOPPatientListScreen } from './react-components/MyOPPatientListScreen';

// Import AllOPPatientListScreen Component
import { AllOPPatientListScreen } from './react-components/AllOPPatientListScreen';

// Import PreviousOPPatientListScreen Component (three mounts: Name filter, Date filter, Grid)
import { PreviousOPPatientNameFilterScreen, PreviousOPPatientDateFilterScreen, PreviousOPPatientGridScreen } from './react-components/PreviousOPPatientListScreen';

// Import PatientSearchScreen Component
import { PatientSearchScreen } from './react-components/PatientSearchScreen';

// Import QMSPatientsScreen Component
import { QMSPatientsScreen } from './react-components/QMSPatientsScreen';

// Import PayoutAttachmentListScreen Component
import { PayoutAttachmentListScreen } from './react-components/PayoutAttachmentListScreen';

// Import PatientAttachmentsScreen Component
import { PatientAttachmentsScreen } from './react-components/PatientAttachmentsScreen';

// Import OrderTrackerScreen Component
import { OrderTrackerScreen } from './react-components/OrderTrackerScreen';

// Import PatientPickerArchiveScreen Component
import { PatientPickerArchiveScreen } from './react-components/PatientPickerArchiveScreen';

// Import PatientFeedbackScreen Component
import { PatientFeedbackScreen } from './react-components/PatientFeedbackScreen';

// Import PatientTrackerScreen Component
import { PatientTrackerScreen } from './react-components/PatientTrackerScreen';

// Import PatientFollowupTabScreen Component
import { PatientFollowupTabScreen } from './react-components/PatientFollowupTabScreen';

// Import PendingFollowup screens (Name filter, Filters, Grid)
import { PendingFollowupNameFilterScreen, PendingFollowupFiltersScreen, PendingFollowupGridScreen } from './react-components/PendingFollowupListScreen';

// Import Followup screens (Name filter, Filters, Grid) -- sibling of PendingFollowup
import { FollowupNameFilterScreen, FollowupFiltersScreen, FollowupGridScreen } from './react-components/FollowupListScreen';

// Import PatientFollowupFormScreen Component
import { PatientFollowupFormScreen } from './react-components/PatientFollowupFormScreen';

// Import PrescriptionsListScreen Component
import { PrescriptionsListScreen } from './react-components/PrescriptionsListScreen';

// Import DoctorPrescribeFormScreen Components (doctorprescribe-form.js/.html --
// see the disclosure comment at the top of DoctorPrescribeFormScreen.tsx)
import {
  DoctorPrescribeFormHeader,
  DoctorPrescribeFormTabs,
  DoctorPrescribeFormFieldsRow1,
  DoctorPrescribeFormFieldsRow2,
  DoctorPrescribeFormNotesSection,
  DoctorPrescribeFormFooter,
} from './react-components/DoctorPrescribeFormScreen';

// Import LoginPage Component
import { LoginPage } from './react-components/LoginPage';

// Import SidebarComponent Component
import { SidebarComponent } from './react-components/SidebarComponent';

// Import TopNavbarComponent Component
import { TopNavbarComponent } from './react-components/TopNavbarComponent';

// Import FrontOfficeDashboardComponent Component
import { FrontOfficeDashboardComponent } from './react-components/FrontOfficeDashboardComponent';

// Import DoctorDashboardTopSection Component
import { DoctorDashboardTopSection } from './react-components/DoctorDashboardTopSection';

// Import AdminDashboardComponent Component
import { AdminDashboardComponent } from './react-components/AdminDashboardComponent';

// Import LabDashboardComponent Component
import { LabDashboardComponent } from './react-components/LabDashboardComponent';

// Import NursingDashboardComponent Component
import { NursingDashboardComponent } from './react-components/NursingDashboardComponent';

// Import Registration Toolbars
import { RegistrationActionBar } from './react-components/RegistrationActionBar';
import { RegistrationFooter } from './react-components/RegistrationFooter';
import { TodayOpdVisits } from './react-components/TodayOpdVisits';

// Import OP Billing Toolbars
import { OPBillingActionBar } from './react-components/OPBillingActionBar';
import { OPBillingSaveBar } from './react-components/OPBillingSaveBar';

// Import Shared Components
import { PrintControl } from './react-components/PrintControl';
import { PatientSearchControl } from './react-components/PatientSearchControl';
import { AgeDisplay } from './react-components/AgeDisplay';
import { CityControl } from './react-components/CityControl';
import { PincodeControl } from './react-components/PincodeControl';
import { CountryControl } from './react-components/CountryControl';
import { StateControl } from './react-components/StateControl';
import { DistrictControl } from './react-components/DistrictControl';
import { AreaControl } from './react-components/AreaControl';
import { BillingDashboardComponent } from './react-components/BillingDashboardComponent';
import { PharmacyDashboardComponent } from './react-components/PharmacyDashboardComponent';
import { RichTextEditor } from './react-components/RichTextEditor';

// Import Button and ConfirmModal Components
import { Button } from './react-components/Button';
import { ConfirmModal } from './react-components/ConfirmModal';

// Import EMR Clinical Workstation & Portal Components
import { EmrPortalHubScreen } from './react-components/EmrPortalHubScreen';
import { DischargeSummaryScreen } from './react-components/DischargeSummaryScreen';
import { EmrFormAssemblyScreen } from './react-components/EmrFormAssemblyScreen';
import { EmrMastersScreen } from './react-components/EmrMastersScreen';
import { EmrVisitSummaryScreen } from './react-components/EmrVisitSummaryScreen';
import { InvestigationFollowupTrackerScreen } from './react-components/InvestigationFollowupTrackerScreen';
import { PatientIdentityBanner } from './react-components/PatientIdentityBanner';
import { PatientAllergyScreen } from './react-components/PatientAllergyScreen';
import { PatientVitalScreen } from './react-components/PatientVitalScreen';
import { PatientDiagnosisScreen } from './react-components/PatientDiagnosisScreen';
import { PatientOrderScreen } from './react-components/PatientOrderScreen';
import { PrescriptionDetailRowComponent } from './react-components/PrescriptionDetailRowComponent';
import { WardEmarScreen } from './react-components/WardEmarScreen';
import { WardHandoverScreen } from './react-components/WardHandoverScreen';
import { WardFluidBalanceScreen } from './react-components/WardFluidBalanceScreen';
import { WardNursingNotesScreen } from './react-components/WardNursingNotesScreen';
import { ClinicalAuditTrailScreen } from './react-components/ClinicalAuditTrailScreen';
import { ClinicalCdsAlertsScreen } from './react-components/ClinicalCdsAlertsScreen';
import { createRoot } from 'react-dom/client';

(window as any).renderReactConfirmModal = function(options: {
  title?: string;
  message?: string;
  yesLabel?: string;
  noLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success' | 'info';
  icon?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const cleanup = () => {
    root.unmount();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  root.render(
    <ConfirmModal
      isOpen={true}
      title={options.title || 'Confirm'}
      message={options.message || ''}
      yesLabel={options.yesLabel || 'Yes'}
      noLabel={options.noLabel}
      variant={options.variant}
      icon={options.icon}
      onConfirm={() => {
        cleanup();
        if (options.onConfirm) options.onConfirm();
      }}
      onCancel={() => {
        cleanup();
        if (options.onCancel) options.onCancel();
      }}
      onClose={() => {
        cleanup();
        if (options.onCancel) options.onCancel();
      }}
    />
  );
};

import { BarcodeModal } from './react-components/BarcodeModal';
import type { PatientBarcodeData } from './react-components/BarcodeModal';

(window as any).renderReactBarcodeModal = function(options: {
  data: PatientBarcodeData;
  onClose?: () => void;
  onRawPrint?: () => void;
}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const cleanup = () => {
    root.unmount();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  root.render(
    <BarcodeModal
      isOpen={true}
      data={options.data || {}}
      onClose={() => {
        cleanup();
        if (options.onClose) options.onClose();
      }}
      onRawPrint={options.onRawPrint ? () => {
        options.onRawPrint!();
      } : undefined}
    />
  );
};

import { BarcodeMasterSettingsComponent } from './react-components/BarcodeMasterSettingsComponent';
import { FindBillModalComponent } from './react-components/FindBillModalComponent';
import { CityMasterListScreen } from './react-components/CityMasterListScreen';
import { CityMasterFormScreen } from './react-components/CityMasterFormScreen';
import { StateMasterListScreen } from './react-components/StateMasterListScreen';
import { StateMasterFormScreen } from './react-components/StateMasterFormScreen';
import { CountryMasterListScreen } from './react-components/CountryMasterListScreen';
import { CountryMasterFormScreen } from './react-components/CountryMasterFormScreen';
import { AllergyReactionListScreen } from './react-components/AllergyReactionListScreen';
import { AllergyMasterListScreen } from './react-components/AllergyMasterListScreen';
import { ChiefComplaintListScreen } from './react-components/ChiefComplaintListScreen';
import { DiagnosisListScreen } from './react-components/DiagnosisListScreen';
import { DietItemListScreen } from './react-components/DietItemListScreen';
import { VitalMasterListScreen } from './react-components/VitalMasterListScreen';
import { DistrictMasterListScreen } from './react-components/DistrictMasterListScreen';
import { DistrictMasterFormScreen } from './react-components/DistrictMasterFormScreen';
import { PincodeMasterListScreen } from './react-components/PincodeMasterListScreen';
import { PincodeMasterFormScreen } from './react-components/PincodeMasterFormScreen';
import { OccupationMasterListScreen } from './react-components/OccupationMasterListScreen';
import { OccupationMasterFormScreen } from './react-components/OccupationMasterFormScreen';
import { PendingProceduresPickerScreen } from './react-components/PendingProceduresPickerScreen';
import { ReceiptPickerScreen } from './react-components/ReceiptPickerScreen';
import { PendingOrderPickerScreen } from './react-components/PendingOrderPickerScreen';
import { OpPharmacyBillsScreen } from './react-components/OpPharmacyBillsScreen';
import { ClinicalPendingOrdersListScreen } from './react-components/ClinicalPendingOrdersListScreen';
import { DashboardReportsMenuScreen } from './react-components/DashboardReportsMenuScreen';
import { BillingReceiptListScreen } from './react-components/BillingReceiptListScreen';
import { BillingRefundFormScreen } from './react-components/BillingRefundFormScreen';
import { BillingCreditNoteListScreen } from './react-components/BillingCreditNoteListScreen';
import { BillingCreditNoteFormScreen } from './react-components/BillingCreditNoteFormScreen';
import { BillingCnPickerScreen } from './react-components/BillingCnPickerScreen';
import { BillingOutstandingBillPickerScreen } from './react-components/BillingOutstandingBillPickerScreen';
import { BillingReportsTabScreen } from './react-components/BillingReportsTabScreen';
import { BillingSurgeryReportScreen } from './react-components/BillingSurgeryReportScreen';
import { BillingMasterReportScreen } from './react-components/BillingMasterReportScreen';
import { BillingRevenueReportScreen } from './react-components/BillingRevenueReportScreen';
import { BillingOpInvoiceReportScreen } from './react-components/BillingOpInvoiceReportScreen';
import { BillingIpInvoiceReportScreen } from './react-components/BillingIpInvoiceReportScreen';
import { BillingLhrcVoucherListScreen, BillingLhrcVoucherGridScreen } from './react-components/BillingLhrcVoucherListScreen';
import { BillingLhrcVoucherFormScreen } from './react-components/BillingLhrcVoucherFormScreen';
import { BillingLhrcVoucherFormDetailsScreen } from './react-components/BillingLhrcVoucherFormDetailsScreen';
import { BillingBillingCollectionsScreen } from './react-components/BillingBillingCollectionsScreen';
import { BillingIpBillingCollectionsScreen } from './react-components/BillingIpBillingCollectionsScreen';
import { BillingConsolidatePaymentFilterScreen } from './react-components/BillingConsolidatePaymentFilterScreen';
import { BillingConsolidatePaymentGridScreen } from './react-components/BillingConsolidatePaymentGridScreen';
import { BillingConsolidatePaymentFooterScreen } from './react-components/BillingConsolidatePaymentFooterScreen';
import { BillingConsolidatePaymentActionsScreen } from './react-components/BillingConsolidatePaymentActionsScreen';
import { BillingBankStatementListScreen } from './react-components/BillingBankStatementListScreen';
import { BillingBankStatementFormScreen } from './react-components/BillingBankStatementFormScreen';
import { BillingCounterFormScreen } from './react-components/BillingCounterFormScreen';
import { BillingCounterListScreen } from './react-components/BillingCounterListScreen';
import { BillingCashSubmissionHeaderScreen } from './react-components/BillingCashSubmissionHeaderScreen';
import { BillingCashSubmissionListScreen } from './react-components/BillingCashSubmissionListScreen';
import { BillingCashSubmissionFormScreen } from './react-components/BillingCashSubmissionFormScreen';
import { BillingDiscountApprovalListScreen } from './react-components/BillingDiscountApprovalListScreen';
import { BillingEditDiscountScreen } from './react-components/BillingEditDiscountScreen';
import { DrPaymentModifyBillNoScreen } from './react-components/DrPaymentModifyBillNoScreen';
import { DrPaymentModifyFilterScreen } from './react-components/DrPaymentModifyFilterScreen';
import { DrPaymentModifyListScreen } from './react-components/DrPaymentModifyListScreen';
import { DrPaymentModifyFormHeaderScreen } from './react-components/DrPaymentModifyFormHeaderScreen';
import { DrPaymentModifyFormDetailsScreen } from './react-components/DrPaymentModifyFormDetailsScreen';
import { DrPaymentModifyListNepalScreen } from './react-components/DrPaymentModifyListNepalScreen';
import { DrPaymentModifyNepalFormScreen } from './react-components/DrPaymentModifyNepalFormScreen';
import { DrPaymentModifyNepalFilterFieldScreen } from './react-components/DrPaymentModifyNepalFilterFieldScreen';
import { DrPaymentModifyNepalListScreen } from './react-components/DrPaymentModifyNepalListScreen';
import { DrShareListScreen } from './react-components/DrShareListScreen';
import { DrShareHeaderScreen } from './react-components/DrShareHeaderScreen';
import { DrShareCategoryTabScreen } from './react-components/DrShareCategoryTabScreen';
import { DrShareItemsListScreen } from './react-components/DrShareItemsListScreen';
import { DrShareRangeTabScreen } from './react-components/DrShareRangeTabScreen';
import { CancelRemarksScreen } from './react-components/CancelRemarksScreen';
import { EditUnlockBillingRequestScreen } from './react-components/EditUnlockBillingRequestScreen';
import { UnlockBillingFilterScreen } from './react-components/UnlockBillingFilterScreen';
import { UnlockBillingListScreen } from './react-components/UnlockBillingListScreen';
import { PaymodeTabScreen } from './react-components/PaymodeTabScreen';
import { PaymodeChangeFilterScreen } from './react-components/PaymodeChangeFilterScreen';
import { PaymodeChangeListScreen } from './react-components/PaymodeChangeListScreen';
import { PromotionalSchemesListScreen } from './react-components/PromotionalSchemesListScreen';
import { PrivilegeCardListScreen } from './react-components/PrivilegeCardListScreen';
import { DailyCollectionListScreen } from './react-components/DailyCollectionListScreen';
import { IpBillingRequestFilterScreen } from './react-components/IpBillingRequestFilterScreen';
import { IpBillingRequestListScreen } from './react-components/IpBillingRequestListScreen';
import { EditIpBillingRequestScreen } from './react-components/EditIpBillingRequestScreen';
import { EditDetailIpBillingRequestHeaderScreen } from './react-components/EditDetailIpBillingRequestHeaderScreen';
import { EditDetailIpBillingRequestListScreen } from './react-components/EditDetailIpBillingRequestListScreen';
import { DetailIpBillingRequestFilterScreen } from './react-components/DetailIpBillingRequestFilterScreen';
import { DetailIpBillingRequestListScreen } from './react-components/DetailIpBillingRequestListScreen';
import { GeneralExpensesFilterScreen } from './react-components/GeneralExpensesFilterScreen';
import { GeneralExpensesListScreen } from './react-components/GeneralExpensesListScreen';
import { BillDiscountTabScreen } from './react-components/BillDiscountTabScreen';
import { BillDiscountFilterScreen } from './react-components/BillDiscountFilterScreen';
import { BillDiscountListScreen } from './react-components/BillDiscountListScreen';
import { CreditApprovalTabScreen } from './react-components/CreditApprovalTabScreen';
import { CreditApprovalFilterScreen } from './react-components/CreditApprovalFilterScreen';
import { CreditApprovalListScreen } from './react-components/CreditApprovalListScreen';
import { EditCreditApprovalScreen } from './react-components/EditCreditApprovalScreen';
import { PatientFinanceTabScreen } from './react-components/PatientFinanceTabScreen';
import { PatientFinanceFilterScreen } from './react-components/PatientFinanceFilterScreen';
import { PatientAdjustmentInfoListScreen } from './react-components/PatientAdjustmentInfoListScreen';
import { PatientRevenueInfoListScreen } from './react-components/PatientRevenueInfoListScreen';
import { PhysioTreatmentPlanFilterScreen } from './react-components/PhysioTreatmentPlanFilterScreen';
import { PhysioTreatmentPlanListScreen } from './react-components/PhysioTreatmentPlanListScreen';
import { TreatmentPlanBillingFilterScreen } from './react-components/TreatmentPlanBillingFilterScreen';
import { TreatmentPlanBillingListScreen } from './react-components/TreatmentPlanBillingListScreen';
import { ClaimHistoryScreen } from './react-components/ClaimHistoryScreen';
import { ClaimProcessFilterScreen } from './react-components/ClaimProcessFilterScreen';
import { ClaimProcessListScreen } from './react-components/ClaimProcessListScreen';
import { ChecklistFilterScreen } from './react-components/ChecklistFilterScreen';
import { ChecklistListScreen } from './react-components/ChecklistListScreen';
import { ChecklistFormScreen } from './react-components/ChecklistFormScreen';
import { ChecklistFormDetailsScreen } from './react-components/ChecklistFormDetailsScreen';
import { ClaimCoveringLetterScreen } from './react-components/ClaimCoveringLetterScreen';
import { ClaimCoveringLetterViewScreen } from './react-components/ClaimCoveringLetterViewScreen';
import { ReceivedReceiptsFilterScreen } from './react-components/ReceivedReceiptsFilterScreen';
import { ReceivedReceiptsListScreen } from './react-components/ReceivedReceiptsListScreen';
import { ClaimSubmissionFilterScreen } from './react-components/ClaimSubmissionFilterScreen';
import { ClaimSubmissionListScreen } from './react-components/ClaimSubmissionListScreen';
import { ClaimSubmissionFormScreen } from './react-components/ClaimSubmissionFormScreen';
import { ClaimSubmissionFormBillsScreen } from './react-components/ClaimSubmissionFormBillsScreen';
import { EstimationBillingFilterScreen } from './react-components/EstimationBillingFilterScreen';
import { EstimationBillingListScreen } from './react-components/EstimationBillingListScreen';
import { ServiceGroupRateMappingListScreen } from './react-components/ServiceGroupRateMappingListScreen';
import { PrivilegeCardFormScreen } from './react-components/PrivilegeCardFormScreen';
import { PrivilegeCardRegScreen } from './react-components/PrivilegeCardRegScreen';
import { RefundListFilterScreen } from './react-components/RefundListFilterScreen';
import { OpClearancePatientInfoScreen } from './react-components/OpClearancePatientInfoScreen';
import { OpClearanceBillsTablesScreen } from './react-components/OpClearanceBillsTablesScreen';
import { OpClearancePaymentScreen } from './react-components/OpClearancePaymentScreen';
import { UaeBillingVisitDetailsScreen } from './react-components/UaeBillingVisitDetailsScreen';
import { UaeBillingPaymentScreen } from './react-components/UaeBillingPaymentScreen';
import { PendingBillListTableScreen } from './react-components/PendingBillListTableScreen';
import { OutstandingBillListTableScreen } from './react-components/OutstandingBillListTableScreen';
import { AdjustAgainstAdvanceScreen } from './react-components/AdjustAgainstAdvanceScreen';
import { InsuranceUpdatePayerScreen } from './react-components/InsuranceUpdatePayerScreen';
import { InsuranceUpdateBillListScreen } from './react-components/InsuranceUpdateBillListScreen';
import { PatientFinanceInfoListScreen } from './react-components/PatientFinanceInfoListScreen';
import { ExecutableProcedureListFilterScreen } from './react-components/ExecutableProcedureListFilterScreen';
import { ExecutableProcedureFormScreen } from './react-components/ExecutableProcedureFormScreen';
import { BillingRequestFilterScreen } from './react-components/BillingRequestFilterScreen';
import { BillingRequestListScreen } from './react-components/BillingRequestListScreen';
import { IpBillListServiceCategoryScreen } from './react-components/IpBillListServiceCategoryScreen';
import { IpBillListTableScreen } from './react-components/IpBillListTableScreen';
import { OpBillingPackItemsScreen } from './react-components/OpBillingPackItemsScreen';
import { DrShareSelectionScreen } from './react-components/DrShareSelectionScreen';
import { OpBillingMoreFormScreen } from './react-components/OpBillingMoreFormScreen';
import { CancelReceiptListScreen } from './react-components/CancelReceiptListScreen';
import { OpBillingFormSelectScreen } from './react-components/OpBillingFormSelectScreen';
import { OpBillingHeaderSelectScreen } from './react-components/OpBillingHeaderSelectScreen';
import { OpBillingDiscountApprovalScreen } from './react-components/OpBillingDiscountApprovalScreen';
import { OpBillingFooterPaymentScreen } from './react-components/OpBillingFooterPaymentScreen';
import { ServiceGroupRateMappingSelectScreen } from './react-components/ServiceGroupRateMappingSelectScreen';
import { BillHistoryListScreen } from './react-components/BillHistoryListScreen';
import { DispatchDetailFormScreen } from './react-components/DispatchDetailFormScreen';
import { ClaimReceiptSelectScreen } from './react-components/ClaimReceiptSelectScreen';
import { RefundPickerGridScreen } from './react-components/RefundPickerGridScreen';
import { EstimateBillDiscountModeScreen } from './react-components/EstimateBillDiscountModeScreen';
import { TransferredFileReceiveStatusFilterScreen } from './react-components/TransferredFileReceiveStatusFilterScreen';
import { TransferredFileReceiveListScreen } from './react-components/TransferredFileReceiveListScreen';
import { IpMrdFileTransferStatusFilterScreen } from './react-components/IpMrdFileTransferStatusFilterScreen';
import { IpMrdFileTransferListScreen } from './react-components/IpMrdFileTransferListScreen';
import { TransferredFileReturnsStatusFilterScreen } from './react-components/TransferredFileReturnsStatusFilterScreen';
import { TransferredFileReturnsListScreen } from './react-components/TransferredFileReturnsListScreen';
import { EditDrShareInfoListScreen } from './react-components/EditDrShareInfoListScreen';
import { DiscountFormModeScreen } from './react-components/DiscountFormModeScreen';
import { OpBillingInfoFormSelectScreen } from './react-components/OpBillingInfoFormSelectScreen';
import { IpFileTransferReceiveStatusFilterScreen } from './react-components/IpFileTransferReceiveStatusFilterScreen';
import { IpFileTransferReceiveListScreen } from './react-components/IpFileTransferReceiveListScreen';
import { BridgeGridScreen } from './react-components/BridgeGridScreen';
import { BridgeLookupSelectScreen } from './react-components/BridgeLookupSelectScreen';
import { ClaimReceiptBillsTableScreen } from './react-components/ClaimReceiptBillsTableScreen';
import { NewReceiptBillsTableScreen } from './react-components/NewReceiptBillsTableScreen';
import { ItemwiseOpBillCancelSelectScreen } from './react-components/ItemwiseOpBillCancelSelectScreen';
import { ItemwiseOpBillCancelTableScreen } from './react-components/ItemwiseOpBillCancelTableScreen';
import { EmrWorkspaceScreen } from './react-components/emr-workspace/EmrWorkspaceScreen';
import { EmrPanelSelectionScreen } from './react-components/emr-admin/EmrPanelSelectionScreen';
import { EmrFormAssemblyBuilderScreen } from './react-components/emr-admin/EmrFormAssemblyBuilderScreen';
import { EmrPanelEditorScreen } from './react-components/emr-admin/EmrPanelEditorScreen';
import { DischargeWorkstationScreen } from './react-components/discharge-workstation/DischargeWorkstationScreen';
import { MrdOtReportScreen } from './react-components/legacy-screens/MrdOtReportScreen';
import { TestTemplateMasterScreen } from './react-components/legacy-screens/TestTemplateMasterScreen';
import { AntibioticCultureScreen } from './react-components/legacy-screens/AntibioticCultureScreen';
import { DispensedItemsPickerScreen } from './react-components/legacy-screens/DispensedItemsPickerScreen';
// Print API for the AngularJS print controllers (window.HimsPrint); QZ Tray loads on the first print
import './printing/himsPrint';

// Register components globally so the AngularJS bridge can find them
(window as any).ReactComponents = {
  ...(window as any).ReactComponents,
  Button,
  ConfirmModal,
  BarcodeModal,
  BarcodeMasterSettingsComponent,
  FindBillModalComponent,
  PilotComponent,
  DefaultRegistrationScreen,
  RegisteredPatientsScreen,
  PatientRegistrationSelfScreen,
  NewRegistrationScreen,
  PatientRegistrationFormScreen,
  QuickRegistrationFormScreen,
  FullRegistrationPatientOptions,
  FullRegistrationScreen,
  FullRegistrationFooter,
  RegistrationCumVisitScreen,
  RegistrationCumVisitFooter,
  PatientIdentityListScreen,
  PatientKinListScreen,
  FamilyLinkActionBar,
  FamilyLinkFooter,
  PatientGuarantorListScreen,
  PatientKinFormScreen,
  PatientPrintsScreen,
  PatientIdentityFormScreen,
  FullRegistrationTabScreen,
  CurrentInpatientScreen,
  PatientGuarantorGLFormScreen,
  PatientIdDocumentsScreen,
  PatientDemographicUpdateScreen,
  PatientDeathRecordFormScreen,
  DeceasedFormScreen,
  DeactivateRemarksScreen,
  BillingRemarksScreen,
  AppointmentsTabScreen,
  AppointmentHistoryModal,
  PreviousAppointmentModal,
  DischargedPatientsScreen,
  InpatientTabScreen,
  OpdBillScreen,
  VisitCreateFormPatientHeader,
  VisitCreateFormTopFields,
  VisitCreateFormMidFields,
  VisitCreateFormLowerFields,
  VisitCreateFormBillingSection,
  VisitCreateFormFooter,
  EncounterGuarantorListScreen,
  EncounterGuarantorUpdateFormScreen,
  EncounterGuarantorGLFormScreen,
  AllInpatientListScreen,
  MyInpatientListScreen,
  PatientDischargeListScreen,
  PendingDischargesScreen,
  CurrentInpatientListScreen,
  OppatientTabScreen,
  MyOPPatientListScreen,
  AllOPPatientListScreen,
  PreviousOPPatientNameFilterScreen,
  PreviousOPPatientDateFilterScreen,
  PreviousOPPatientGridScreen,
  PatientSearchScreen,
  QMSPatientsScreen,
  PayoutAttachmentListScreen,
  PatientAttachmentsScreen,
  OrderTrackerScreen,
  PatientPickerArchiveScreen,
  PatientFeedbackScreen,
  PatientTrackerScreen,
  PatientFollowupTabScreen,
  PendingFollowupNameFilterScreen,
  PendingFollowupFiltersScreen,
  PendingFollowupGridScreen,
  FollowupNameFilterScreen,
  FollowupFiltersScreen,
  FollowupGridScreen,
  PatientFollowupFormScreen,
  PrescriptionsListScreen,
  DoctorPrescribeFormHeader,
  DoctorPrescribeFormTabs,
  DoctorPrescribeFormFieldsRow1,
  DoctorPrescribeFormFieldsRow2,
  DoctorPrescribeFormNotesSection,
  DoctorPrescribeFormFooter,
  LoginPage,
  SidebarComponent,
  TopNavbarComponent,
  FrontOfficeDashboardComponent,
  BillingDashboardComponent,
  DoctorDashboardTopSection,
  AdminDashboardComponent,
  LabDashboardComponent,
  NursingDashboardComponent,
  RegistrationActionBar,
  RegistrationFooter,
  TodayOpdVisits,
  OPBillingActionBar,
  OPBillingSaveBar,
  PrintControl,
  PatientSearchControl,
  AgeDisplay,
  CityControl,
  PincodeControl,
  CountryControl,
  StateControl,
  DistrictControl,
  AreaControl,
  PharmacyDashboardComponent,
  RichTextEditor,
  CityMasterListScreen,
  CityMasterFormScreen,
  StateMasterListScreen,
  StateMasterFormScreen,
  CountryMasterListScreen,
  CountryMasterFormScreen,
  AllergyReactionListScreen,
  AllergyMasterListScreen,
  ChiefComplaintListScreen,
  DiagnosisListScreen,
  DietItemListScreen,
  VitalMasterListScreen,
  DistrictMasterListScreen,
  DistrictMasterFormScreen,
  PincodeMasterListScreen,
  PincodeMasterFormScreen,
  OccupationMasterListScreen,
  OccupationMasterFormScreen,
  PendingProceduresPickerScreen,
  ReceiptPickerScreen,
  PendingOrderPickerScreen,
  OpPharmacyBillsScreen,
  ClinicalPendingOrdersListScreen,
  DashboardReportsMenuScreen,
  BillingReceiptListScreen,
  BillingRefundFormScreen,
  BillingCreditNoteListScreen,
  BillingCreditNoteFormScreen,
  BillingCnPickerScreen,
  BillingOutstandingBillPickerScreen,
  BillingReportsTabScreen,
  BillingSurgeryReportScreen,
  BillingMasterReportScreen,
  BillingRevenueReportScreen,
  BillingOpInvoiceReportScreen,
  BillingIpInvoiceReportScreen,
  BillingLhrcVoucherListScreen,
  BillingLhrcVoucherGridScreen,
  BillingLhrcVoucherFormScreen,
  BillingLhrcVoucherFormDetailsScreen,
  BillingBillingCollectionsScreen,
  BillingIpBillingCollectionsScreen,
  BillingConsolidatePaymentFilterScreen,
  BillingConsolidatePaymentGridScreen,
  BillingConsolidatePaymentFooterScreen,
  BillingConsolidatePaymentActionsScreen,
  BillingBankStatementListScreen,
  BillingBankStatementFormScreen,
  BillingCounterFormScreen,
  BillingCounterListScreen,
  BillingCashSubmissionHeaderScreen,
  BillingCashSubmissionListScreen,
  BillingCashSubmissionFormScreen,
  BillingDiscountApprovalListScreen,
  BillingEditDiscountScreen,
  DrPaymentModifyBillNoScreen,
  DrPaymentModifyFilterScreen,
  DrPaymentModifyListScreen,
  DrPaymentModifyFormHeaderScreen,
  DrPaymentModifyFormDetailsScreen,
  DrPaymentModifyListNepalScreen,
  DrPaymentModifyNepalFormScreen,
  DrPaymentModifyNepalFilterFieldScreen,
  DrPaymentModifyNepalListScreen,
  DrShareListScreen,
  DrShareHeaderScreen,
  DrShareCategoryTabScreen,
  DrShareItemsListScreen,
  DrShareRangeTabScreen,
  CancelRemarksScreen,
  EditUnlockBillingRequestScreen,
  UnlockBillingFilterScreen,
  UnlockBillingListScreen,
  PaymodeTabScreen,
  PaymodeChangeFilterScreen,
  PaymodeChangeListScreen,
  PromotionalSchemesListScreen,
  PrivilegeCardListScreen,
  DailyCollectionListScreen,
  IpBillingRequestFilterScreen,
  IpBillingRequestListScreen,
  EditIpBillingRequestScreen,
  EditDetailIpBillingRequestHeaderScreen,
  EditDetailIpBillingRequestListScreen,
  DetailIpBillingRequestFilterScreen,
  DetailIpBillingRequestListScreen,
  GeneralExpensesFilterScreen,
  GeneralExpensesListScreen,
  BillDiscountTabScreen,
  BillDiscountFilterScreen,
  BillDiscountListScreen,
  CreditApprovalTabScreen,
  CreditApprovalFilterScreen,
  CreditApprovalListScreen,
  EditCreditApprovalScreen,
  PatientFinanceTabScreen,
  PatientFinanceFilterScreen,
  PatientAdjustmentInfoListScreen,
  PatientRevenueInfoListScreen,
  PhysioTreatmentPlanFilterScreen,
  PhysioTreatmentPlanListScreen,
  TreatmentPlanBillingFilterScreen,
  TreatmentPlanBillingListScreen,
  ClaimHistoryScreen,
  ClaimProcessFilterScreen,
  ClaimProcessListScreen,
  ChecklistFilterScreen,
  ChecklistListScreen,
  ChecklistFormScreen,
  ChecklistFormDetailsScreen,
  ClaimCoveringLetterScreen,
  ClaimCoveringLetterViewScreen,
  ReceivedReceiptsFilterScreen,
  ReceivedReceiptsListScreen,
  ClaimSubmissionFilterScreen,
  ClaimSubmissionListScreen,
  ClaimSubmissionFormScreen,
  ClaimSubmissionFormBillsScreen,
  EstimationBillingFilterScreen,
  EstimationBillingListScreen,
  ServiceGroupRateMappingListScreen,
  PrivilegeCardFormScreen,
  PrivilegeCardRegScreen,
  RefundListFilterScreen,
  OpClearancePatientInfoScreen,
  OpClearanceBillsTablesScreen,
  OpClearancePaymentScreen,
  UaeBillingVisitDetailsScreen,
  UaeBillingPaymentScreen,
  PendingBillListTableScreen,
  OutstandingBillListTableScreen,
  AdjustAgainstAdvanceScreen,
  InsuranceUpdatePayerScreen,
  InsuranceUpdateBillListScreen,
  PatientFinanceInfoListScreen,
  ExecutableProcedureListFilterScreen,
  ExecutableProcedureFormScreen,
  BillingRequestFilterScreen,
  BillingRequestListScreen,
  IpBillListServiceCategoryScreen,
  IpBillListTableScreen,
  OpBillingPackItemsScreen,
  DrShareSelectionScreen,
  OpBillingMoreFormScreen,
  CancelReceiptListScreen,
  OpBillingFormSelectScreen,
  OpBillingHeaderSelectScreen,
  OpBillingDiscountApprovalScreen,
  OpBillingFooterPaymentScreen,
  ServiceGroupRateMappingSelectScreen,
  BillHistoryListScreen,
  DispatchDetailFormScreen,
  ClaimReceiptSelectScreen,
  RefundPickerGridScreen,
  EstimateBillDiscountModeScreen,
  TransferredFileReceiveStatusFilterScreen,
  TransferredFileReceiveListScreen,
  IpMrdFileTransferStatusFilterScreen,
  IpMrdFileTransferListScreen,
  TransferredFileReturnsStatusFilterScreen,
  TransferredFileReturnsListScreen,
  EditDrShareInfoListScreen,
  DiscountFormModeScreen,
  OpBillingInfoFormSelectScreen,
  IpFileTransferReceiveStatusFilterScreen,
  IpFileTransferReceiveListScreen,
  BridgeGridScreen,
  BridgeLookupSelectScreen,
  ClaimReceiptBillsTableScreen,
  NewReceiptBillsTableScreen,
  ItemwiseOpBillCancelSelectScreen,
  ItemwiseOpBillCancelTableScreen,
  // EMR Clinical Workstation & Portal
  EmrPortalHubScreen,
  DischargeSummaryScreen,
  EmrFormAssemblyScreen,
  EmrMastersScreen,
  EmrVisitSummaryScreen,
  EmrWorkspaceScreen,
  EmrPanelSelectionScreen,
  EmrFormAssemblyBuilderScreen,
  EmrPanelEditorScreen,
  DischargeWorkstationScreen,
  MrdOtReportScreen,
  TestTemplateMasterScreen,
  AntibioticCultureScreen,
  DispensedItemsPickerScreen,
  InvestigationFollowupTrackerScreen,
  PatientIdentityBanner,
  PatientAllergyScreen,
  PatientVitalScreen,
  PatientDiagnosisScreen,
  PatientOrderScreen,
  PrescriptionDetailRowComponent,
  WardEmarScreen,
  WardHandoverScreen,
  WardFluidBalanceScreen,
  WardNursingNotesScreen,
  ClinicalAuditTrailScreen,
  ClinicalCdsAlertsScreen
};

console.log('React runtime and components loaded. ReactBridge initialized.');

import { AppRoutes } from './routes/AppRoutes';

const path = window.location.pathname;
const isReactRoute = path && path !== '/' && path !== '/index.html';

if (isReactRoute) {
  const mountReactApp = () => {
    const wrapper = document.querySelector('.wrapper') as HTMLElement;
    if (wrapper) wrapper.style.display = 'none';

    let container = document.getElementById('react-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'react-root';
      document.body.appendChild(container);
    }
    const root = createRoot(container);
    root.render(<AppRoutes />);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountReactApp);
  } else {
    mountReactApp();
  }
}

