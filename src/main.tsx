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
import { RegistrationFormComponent } from './react-components/RegistrationFormComponent';
import { FindBillModalComponent } from './react-components/FindBillModalComponent';

// Register components globally so the AngularJS bridge can find them
(window as any).ReactComponents = {
  ...(window as any).ReactComponents,
  Button,
  ConfirmModal,
  BarcodeModal,
  BarcodeMasterSettingsComponent,
  RegistrationFormComponent,
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
  RichTextEditor
};

console.log('React runtime and components loaded. ReactBridge initialized.');

