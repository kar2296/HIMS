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
  BillingReportsTabScreen
};

console.log('React runtime and components loaded. ReactBridge initialized.');

