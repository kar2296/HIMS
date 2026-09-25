import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { sessionHelper } from '../services/sessionHelper';
import { AdminDashboardComponent } from '../react-components/AdminDashboardComponent';
import { EmrPortalHubScreen } from '../react-components/EmrPortalHubScreen';
import { RegisteredPatientsScreen } from '../react-components/RegisteredPatientsScreen';
import { NewRegistrationScreen } from '../react-components/NewRegistrationScreen';
import { OpdBillScreen } from '../react-components/OpdBillScreen';
import { PrescriptionsListScreen } from '../react-components/PrescriptionsListScreen';
import { LabDashboardComponent } from '../react-components/LabDashboardComponent';
import { PatientSearchScreen } from '../react-components/PatientSearchScreen';
import { CountryMasterListScreen } from '../react-components/CountryMasterListScreen';
import { DistrictMasterListScreen } from '../react-components/DistrictMasterListScreen';
import { PincodeMasterListScreen } from '../react-components/PincodeMasterListScreen';
import { PatientIdentityFormScreen } from '../react-components/PatientIdentityFormScreen';
import { PatientKinFormScreen } from '../react-components/PatientKinFormScreen';
import { AllergyReactionListScreen } from '../react-components/AllergyReactionListScreen';
import { AllergyMasterListScreen } from '../react-components/AllergyMasterListScreen';
import { ChiefComplaintListScreen } from '../react-components/ChiefComplaintListScreen';
import { DiagnosisListScreen } from '../react-components/DiagnosisListScreen';
import { DietItemListScreen } from '../react-components/DietItemListScreen';
import { VitalMasterListScreen } from '../react-components/VitalMasterListScreen';
import { DrugFrequencyListScreen } from '../react-components/DrugFrequencyListScreen';

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

        {/* EMR Clinical Portal */}
        <Route
          path="/emr"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrPortalHubScreen />} />
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

        {/* Batch 1: Geographic Masters */}
        <Route
          path="/masters/countries"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<CountryMasterListScreen />} />
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
          path="/masters/pincodes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<PincodeMasterListScreen />} />
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

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
