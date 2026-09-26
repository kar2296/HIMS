import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { sessionHelper } from '../services/sessionHelper';
import { AdminDashboardComponent } from '../react-components/AdminDashboardComponent';
import { EmrWorkspaceScreen } from '../react-components/emr-workspace/EmrWorkspaceScreen';
import { RegisteredPatientsScreen } from '../react-components/RegisteredPatientsScreen';
import { NewRegistrationScreen } from '../react-components/NewRegistrationScreen';
import { OpdBillScreen } from '../react-components/OpdBillScreen';
import { PrescriptionsListScreen } from '../react-components/PrescriptionsListScreen';
import { LabDashboardComponent } from '../react-components/LabDashboardComponent';
import { PatientSearchScreen } from '../react-components/PatientSearchScreen';
import { CountryMasterListScreen } from '../react-components/CountryMasterListScreen';
import { StateMasterListScreen } from '../react-components/StateMasterListScreen';
import { DistrictMasterListScreen } from '../react-components/DistrictMasterListScreen';
import { CityMasterListScreen } from '../react-components/CityMasterListScreen';
import { PincodeMasterListScreen } from '../react-components/PincodeMasterListScreen';
import { OccupationMasterListScreen } from '../react-components/OccupationMasterListScreen';
import { PatientIdentityFormScreen } from '../react-components/PatientIdentityFormScreen';
import { PatientKinFormScreen } from '../react-components/PatientKinFormScreen';
import { AllergyReactionListScreen } from '../react-components/AllergyReactionListScreen';
import { AllergyMasterListScreen } from '../react-components/AllergyMasterListScreen';
import { ChiefComplaintListScreen } from '../react-components/ChiefComplaintListScreen';
import { DiagnosisListScreen } from '../react-components/DiagnosisListScreen';
import { DietItemListScreen } from '../react-components/DietItemListScreen';
import { VitalMasterListScreen } from '../react-components/VitalMasterListScreen';
import { DrugFrequencyListScreen } from '../react-components/DrugFrequencyListScreen';
import { GenericMasterListScreen } from '../react-components/GenericMasterListScreen';
import { ImmunizationListScreen } from '../react-components/ImmunizationListScreen';
import { ServiceCategoryListScreen } from '../react-components/ServiceCategoryListScreen';
import { ServiceRateCategoryListScreen } from '../react-components/ServiceRateCategoryListScreen';
import { ServiceGroupListScreen } from '../react-components/ServiceGroupListScreen';
import { ServiceSubCategoryListScreen } from '../react-components/ServiceSubCategoryListScreen';
import { ProcedureListScreen } from '../react-components/ProcedureListScreen';
import { CategoryTypeListScreen } from '../react-components/CategoryTypeListScreen';
import { AttachmentTypeListScreen } from '../react-components/AttachmentTypeListScreen';
import { DrugMasterListScreen } from '../react-components/DrugMasterListScreen';
import { EmrFormAssemblyScreen } from '../react-components/EmrFormAssemblyScreen';
import { EditEmrVitalScreen } from '../react-components/emr-master/EditEmrVitalScreen';
import { EmrMastersHubScreen } from '../react-components/emr-master/EmrMastersHubScreen';
import { EmrMasterGenericScreen } from '../react-components/emr-master/EmrMasterGenericScreen';

// Route Guard component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = sessionHelper.getAuthToken() || localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    // If running inside AngularJS shell, redirect to page.login
    if ((window as any).angular) {
      const $state = (window as any).angular.element(document.body).injector()?.get('$state');
      if ($state) {
        $state.go('page.login');
        return null;
      }
    }
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Shell container with layout
const ShellWrapper: React.FC<{ activeTab: string; component: React.ReactNode }> = ({ activeTab, component }) => {
  const navigate = useNavigate();
  return (
    <AppLayout activeRoute={activeTab} onNavigate={(tab) => navigate(`/${tab}`)}>
      {component}
    </AppLayout>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route
          path="/login"
          element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f1f5f9' }}>
              <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', width: 380, textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 8px', color: '#1e293b' }}>HIMS Authentication</h2>
                <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>Please authenticate through the primary portal</p>
                <button
                  type="button"
                  onClick={() => { window.location.href = '#/page/login'; }}
                  style={{ width: '100%', padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Proceed to Login
                </button>
              </div>
            </div>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<AdminDashboardComponent />} />
            </ProtectedRoute>
          }
        />

        {/* Registration */}
        <Route
          path="/registration"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="registration" component={<RegisteredPatientsScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/registration/new"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="registration" component={<NewRegistrationScreen />} />
            </ProtectedRoute>
          }
        />

        {/* EMR Clinical Workstation */}
        <Route
          path="/emr"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrWorkspaceScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emrworkspace"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrWorkspaceScreen />} />
            </ProtectedRoute>
          }
        />

        {/* Prescriptions */}
        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<PrescriptionsListScreen />} />
            </ProtectedRoute>
          }
        />

        {/* Billing */}
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<OpdBillScreen />} />
            </ProtectedRoute>
          }
        />

        {/* LIS */}
        <Route
          path="/lis"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<LabDashboardComponent />} />
            </ProtectedRoute>
          }
        />

        {/* Batch 1: Patient Search */}
        <Route
          path="/patientsearch"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="registration" component={<PatientSearchScreen />} />
            </ProtectedRoute>
          }
        />

        {/* General & Geographic Masters */}
        <Route
          path="/masters/countries"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<CountryMasterListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/countrymasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<CountryMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/masters/states"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<StateMasterListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statemasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<StateMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/masters/districts"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<DistrictMasterListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/districtmasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<DistrictMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/masters/cities"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<CityMasterListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citymasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<CityMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/masters/pincodes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<PincodeMasterListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pincodes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<PincodeMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/masters/occupations"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<OccupationMasterListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/occupationmasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<OccupationMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        {/* Batch 1: Patient Identity & Next-of-Kin Sub-forms */}
        <Route
          path="/registration/identity"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="registration" component={<PatientIdentityFormScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/registration/kin"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="registration" component={<PatientKinFormScreen />} />
            </ProtectedRoute>
          }
        />

        {/* Batch 2: Clinical Masters */}
        <Route
          path="/allergyreactions"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<AllergyReactionListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/allergies"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<AllergyMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chiefcomplaints"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ChiefComplaintListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diagnosis"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<DiagnosisListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dietitems"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<DietItemListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vitals"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<VitalMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/drugfrequencies"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<DrugFrequencyListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generics"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<GenericMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/immunizations"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ImmunizationListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/servicecategories"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ServiceCategoryListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/serviceratecategories"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ServiceRateCategoryListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/servicegroups"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ServiceGroupListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/servicesubcategories"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ServiceSubCategoryListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/procedures"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ProcedureListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categorytypes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<CategoryTypeListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attachmenttypes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<AttachmentTypeListScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/drugs"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<DrugMasterListScreen />} />
            </ProtectedRoute>
          }
        />

        {/* EMR Form Assembly & Specialty Panels */}
        <Route
          path="/emr/form-assembly"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrFormAssemblyScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emrformassembly"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrFormAssemblyScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emrpanelselection"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrFormAssemblyScreen />} />
            </ProtectedRoute>
          }
        />

        {/* EMR Standard Vital Panel Element Master */}
        <Route
          path="/emr/edit-vital/:panelId/:formId"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EditEmrVitalScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editemrvital/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EditEmrVitalScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/MasterV9.3/editEMRVital/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EditEmrVitalScreen />} />
            </ProtectedRoute>
          }
        />

        {/* EMR Masters Catalog (All 77 Master Screens with Live Seed Data & CRUD) */}
        <Route
          path="/emr/masters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrMastersHubScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emrmasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrMastersHubScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emr/masters/:masterKey"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrMasterGenericScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/MasterV9.3/:legacyPath"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrMasterGenericScreen />} />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
