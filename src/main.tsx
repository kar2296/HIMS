// Import React and standard Vite entry stuff
import React from 'react';

// Import our custom bridge for AngularJS
import './reactBridge';

// Import Pilot Component
import { PilotComponent } from './react-components/PilotComponent';

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

// Register components globally so the AngularJS bridge can find them
(window as any).ReactComponents = {
  ...(window as any).ReactComponents,
  PilotComponent,
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
