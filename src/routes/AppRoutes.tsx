import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { sessionHelper } from '../services/sessionHelper';
import { AdminDashboardComponent } from '../react-components/AdminDashboardComponent';
import { EmrWorkspaceScreen } from '../react-components/emr-workspace/EmrWorkspaceScreen';
import { RegisteredPatientsScreen } from '../react-components/RegisteredPatientsScreen';
import { NewRegistrationScreen } from '../react-components/NewRegistrationScreen';
import { OpdBillScreen } from '../react-components/OpdBillScreen';
import { OpBillingListScreen } from '../react-components/OpBillingListScreen';
import { DirectBillingListScreen } from '../react-components/DirectBillingListScreen';
import { PrescriptionsListScreen } from '../react-components/PrescriptionsListScreen';
import { LabDashboardComponent } from '../react-components/LabDashboardComponent';
import { PatientSearchScreen } from '../react-components/PatientSearchScreen';
import { CountryMasterListScreen } from '../react-components/CountryMasterListScreen';
import { StateMasterListScreen } from '../react-components/StateMasterListScreen';
import { DistrictMasterListScreen } from '../react-components/DistrictMasterListScreen';
import { CityMasterListScreen } from '../react-components/CityMasterListScreen';
import { PincodeMasterListScreen } from '../react-components/PincodeMasterListScreen';
import { FacilitiesListScreen } from '../react-components/FacilitiesListScreen';
import { FacilityFormScreen } from '../react-components/FacilityFormScreen';
import { FacilityTabScreen } from '../react-components/FacilityTabScreen';
import { DepartmentsListScreen } from '../react-components/DepartmentsListScreen';
import { DepartmentFormScreen } from '../react-components/DepartmentFormScreen';
import { RolesListScreen } from '../react-components/RolesListScreen';
import { RoleTabScreen } from '../react-components/RoleTabScreen';
import { EncounterUpdateListScreen } from '../react-components/EncounterUpdateListScreen';
import { ReferenceValueGroupsListScreen } from '../react-components/ReferenceValueGroupsListScreen';
import { SequenceMastersListScreen } from '../react-components/SequenceMastersListScreen';
import { EventTemplatesListScreen } from '../react-components/EventTemplatesListScreen';
import { EventTemplateFormScreen } from '../react-components/EventTemplateFormScreen';
import { DoctorPaymentModifyScreen } from '../react-components/DoctorPaymentModifyScreen';
import { AppointmentBillPendingListScreen } from '../react-components/AppointmentBillPendingListScreen';
import { AdminAppointmentDashboardScreen } from '../react-components/AdminAppointmentDashboardScreen';
import { RoleFormScreen } from '../react-components/RoleFormScreen';
import { GroupsListScreen } from '../react-components/GroupsListScreen';
import { GroupTabScreen } from '../react-components/GroupTabScreen';
import { OccupationMasterListScreen } from '../react-components/OccupationMasterListScreen';
import { PatientIdentityFormScreen } from '../react-components/PatientIdentityFormScreen';
import { PatientKinFormScreen } from '../react-components/PatientKinFormScreen';
import { AllergyReactionListScreen } from '../react-components/AllergyReactionListScreen';
import { AllergyMasterListScreen } from '../react-components/AllergyMasterListScreen';
import { FeedbackMasterListScreen } from '../react-components/FeedbackMasterListScreen';
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
import { EmrPrintMasterScreen } from '../react-components/emr-master/EmrPrintMasterScreen';
import { TestMastersListScreen } from '../react-components/TestMastersListScreen';
import { AnalyteMastersListScreen } from '../react-components/AnalyteMastersListScreen';
import { TestMasterTabScreen } from '../react-components/TestMasterTabScreen';
import { TestMasterFormScreen } from '../react-components/TestMasterFormScreen';
import { AnalyteTabScreen } from '../react-components/AnalyteTabScreen';
import { AnalyteMasterFormScreen } from '../react-components/AnalyteMasterFormScreen';
import { NoteTemplatesListScreen } from '../react-components/NoteTemplatesListScreen';
import { OrderAcknowledgementListScreen } from '../react-components/OrderAcknowledgementListScreen';
import { OrderAssignmentListScreen } from '../react-components/OrderAssignmentListScreen';
import { AllOrdersProcessListScreen } from '../react-components/AllOrdersProcessListScreen';
import { AllResultApprovalListScreen } from '../react-components/AllResultApprovalListScreen';
import { ResultDispatchListScreen } from '../react-components/ResultDispatchListScreen';
import { SampleReviewListScreen } from '../react-components/SampleReviewListScreen';
import { SampleCollectListScreen } from '../react-components/SampleCollectListScreen';
import { SampleCollectFormScreen } from '../react-components/SampleCollectFormScreen';
import { ContainerTypesListScreen } from '../react-components/ContainerTypesListScreen';
import { ContainerTypeFormScreen } from '../react-components/ContainerTypeFormScreen';
import { SampleTypesListScreen } from '../react-components/SampleTypesListScreen';
import { SampleTypeFormScreen } from '../react-components/SampleTypeFormScreen';
import { AntibioticMastersListScreen } from '../react-components/AntibioticMastersListScreen';
import { AntibioticMasterFormScreen } from '../react-components/AntibioticMasterFormScreen';
import { OrganismIsolatedListScreen } from '../react-components/OrganismIsolatedListScreen';
import { LisRegistrationScreen } from '../react-components/LisRegistrationScreen';
import { LisInterfaceScreen } from '../react-components/LisInterfaceScreen';
import { ExternalProvidersListScreen } from '../react-components/ExternalProvidersListScreen';
import { ExternalLabOrdersListScreen } from '../react-components/ExternalLabOrdersListScreen';
import { OrderStatusChangeScreen } from '../react-components/OrderStatusChangeScreen';
import { InvestigationFollowupTrackerScreen } from '../react-components/InvestigationFollowupTrackerScreen';
import { OrderStatusChangeFormScreen } from '../react-components/OrderStatusChangeFormScreen';
import { ExternalProviderFormScreen } from '../react-components/ExternalProviderFormScreen';
import { RisDashboardComponent } from '../react-components/RisDashboardComponent';
import { RadiologyReportsScreen } from '../react-components/RadiologyReportsScreen';
import { RadiologyCriticalValuesScreen } from '../react-components/RadiologyCriticalValuesScreen';
import { VendorPaymentListScreen } from '../react-components/VendorPaymentListScreen';
import { VendorPaymentFormScreen } from '../react-components/VendorPaymentFormScreen';

const StandaloneContainerTypeRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <ContainerTypeFormScreen id={id ? parseInt(id, 10) : 0} />;
};

const StandaloneSampleTypeRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <SampleTypeFormScreen id={id ? parseInt(id, 10) : 0} />;
};

const StandaloneAntibioticFormRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <AntibioticMasterFormScreen id={id ? parseInt(id, 10) : 0} />;
};

// Standalone route wrappers for TestMaster & AnalyteMaster
const StandaloneTestMasterRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const testId = id ? parseInt(id, 10) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <TestMasterTabScreen reactProps={{ id: testId }} />
      <TestMasterFormScreen reactProps={{ id: testId }} />
    </div>
  );
};

const StandaloneAnalyteRoute: React.FC = () => {
  const { id, analyteId } = useParams<{ id: string; analyteId?: string }>();
  const parsedId = analyteId ? parseInt(analyteId, 10) : (id ? parseInt(id, 10) : 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <AnalyteTabScreen reactProps={{ id: parsedId }} />
      <AnalyteMasterFormScreen reactProps={{ id: parsedId }} />
    </div>
  );
};

const StandaloneOrderAcknowledgementRoute: React.FC = () => {
  const { tp } = useParams<{ tp?: string }>();
  return <OrderAcknowledgementListScreen reactProps={{ tp: tp || '1' }} />;
};

const StandaloneOrderAssignmentRoute: React.FC = () => {
  const { deptId } = useParams<{ deptId?: string }>();
  return <OrderAssignmentListScreen departmentId={deptId || 1} />;
};

const StandaloneAllOrdersRoute: React.FC = () => {
  const { tp } = useParams<{ tp?: string }>();
  return <AllOrdersProcessListScreen reactProps={{ currentfilter: { TestTypeId: tp ? parseInt(tp, 10) : 1 } }} />;
};

const StandaloneResultApprovalRoute: React.FC = () => {
  const { tp } = useParams<{ tp?: string }>();
  return <AllResultApprovalListScreen reactProps={{ currentfilter: { TestTypeId: tp ? parseInt(tp, 10) : 1 } }} />;
};

const StandaloneResultDispatchRoute: React.FC = () => {
  const { tp } = useParams<{ tp?: string }>();
  return <ResultDispatchListScreen reactProps={{ currentfilter: { TestTypeId: tp ? parseInt(tp, 10) : 1 } }} />;
};

const StandaloneSampleCollectRoute: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return <SampleCollectFormScreen reactProps={{ sampleId: id ? parseInt(id, 10) : undefined }} />;
};

const StandaloneLisRegistrationRoute: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return <LisRegistrationScreen reactProps={{ id: id ? parseInt(id, 10) : undefined }} />;
};

const StandaloneLisInterfaceRoute: React.FC = () => {
  return <LisInterfaceScreen />;
};

const StandaloneResultAmendmentRoute: React.FC = () => {
  const { tp } = useParams<{ tp?: string }>();
  return (
    <AllResultApprovalListScreen
      reactProps={{
        currentfilter: { TestTypeId: tp ? parseInt(tp, 10) : 1, WorkOrderStatusId: 7 },
        isAmendment: true,
        context: 'amendment',
      }}
    />
  );
};

const StandaloneExternalProvidersRoute: React.FC = () => {
  return <ExternalProvidersListScreen />;
};

const StandaloneExternalLabOrdersRoute: React.FC = () => {
  return <ExternalLabOrdersListScreen />;
};

const StandaloneMyOrderProcessRoute: React.FC = () => {
  const { tp } = useParams<{ tp?: string }>();
  return (
    <AllOrdersProcessListScreen
      reactProps={{
        currentfilter: { TestTypeId: tp ? parseInt(tp, 10) : 1 },
        context: 'myorder',
      }}
    />
  );
};

const StandaloneOrderStatusChangeRoute: React.FC = () => {
  return <OrderStatusChangeScreen />;
};

const StandaloneOrderStatusChangeFormRoute: React.FC = () => {
  return <OrderStatusChangeFormScreen />;
};

const StandaloneExternalProviderTabRoute: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return <ExternalProviderFormScreen reactProps={{ id: id ? parseInt(id, 10) : 0 }} />;
};

const StandaloneInvestigationTrackingRoute: React.FC = () => {
  return <InvestigationFollowupTrackerScreen />;
};

const StandaloneRisDashboardRoute: React.FC = () => {
  return <RisDashboardComponent />;
};

const StandaloneRadiologyReportsRoute: React.FC = () => {
  return <RadiologyReportsScreen />;
};

const StandaloneRadiologyCriticalsRoute: React.FC = () => {
  return <RadiologyCriticalValuesScreen />;
};

const StandaloneVendorPaymentListRoute: React.FC = () => {
  return <VendorPaymentListScreen />;
};

const StandaloneVendorPaymentFormRoute: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return <VendorPaymentFormScreen id={id ? parseInt(id, 10) : 0} />;
};

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
              <ShellWrapper activeTab="billing" component={<OpBillingListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opbilling"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<OpBillingListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/opbilling-list/:id/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<OpBillingListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/directbilling"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<DirectBillingListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/directbilling/:id/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<DirectBillingListScreen />} />
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
        <Route
          path="/dashboard/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<LabDashboardComponent />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/dashboard/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<LabDashboardComponent />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/labdashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<LabDashboardComponent />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labdashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<LabDashboardComponent />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Masters: Test Masters */}
        <Route
          path="/testmasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<TestMastersListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/testmasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<TestMastersListScreen />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Masters: Analyte Masters */}
        <Route
          path="/analytemasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<AnalyteMastersListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/analytemasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<AnalyteMastersListScreen />} />
            </ProtectedRoute>
          }
        />

        {/* LIS: Test Master Form & Tab */}
        <Route
          path="/testmastertab/:id/testmaster"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneTestMasterRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/testmastertab/:id/testmaster"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneTestMasterRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS: Analyte Master Form & Tab */}
        <Route
          path="/analytetab/:id/analytemaster/:analyteId"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAnalyteRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/analytetab/:id/analytemaster/:analyteId"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAnalyteRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Order Acknowledgement */}
        <Route
          path="/orderacknowledgements"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAcknowledgementRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orderacknowledgements/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAcknowledgementRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/orderacknowledgements/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAcknowledgementRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/orderacknowledgelist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAcknowledgementRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orderacknowledgelist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAcknowledgementRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Order Assignment */}
        <Route
          path="/orderassignmentlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAssignmentRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orderassignmentlist/:deptId"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAssignmentRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/orderassignmentlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAssignmentRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/orderassignmentlist/:deptId"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderAssignmentRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Sample Collection */}
        <Route
          path="/samplecollectlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<SampleCollectListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/samplecollectlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<SampleCollectListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/samplecollectionlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<SampleCollectListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/samplecollect/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneSampleCollectRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/samplecollect/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneSampleCollectRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Masters: Container Types */}
        <Route
          path="/containertypes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<ContainerTypesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/containertypes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<ContainerTypesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/containertype/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneContainerTypeRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/containertype/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneContainerTypeRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Masters: Sample Types */}
        <Route
          path="/sampletypes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<SampleTypesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/sampletypes"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<SampleTypesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sampletype/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneSampleTypeRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/sampletype/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneSampleTypeRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Masters: Antibiotic Masters Form */}
        <Route
          path="/antibioticmaster/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAntibioticFormRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/antibioticmaster/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAntibioticFormRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Sample Review */}
        <Route
          path="/samplereviewlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<SampleReviewListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/samplereviewlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<SampleReviewListScreen />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: All Orders Process */}
        <Route
          path="/allorders"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAllOrdersRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allorders/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAllOrdersRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/allorders/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAllOrdersRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/orderprocesslist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAllOrdersRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orderprocesslist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneAllOrdersRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Result Approval */}
        <Route
          path="/approvalallorders"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultApprovalRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvalallorders/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultApprovalRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/approvalallorders/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultApprovalRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/resultapprovallist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultApprovalRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resultapprovallist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultApprovalRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Result Dispatch */}
        <Route
          path="/resultdispatchlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultDispatchRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resultdispatchlist/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultDispatchRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/resultdispatchlist/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultDispatchRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/resultdispatchlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultDispatchRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Masters: Antibiotics & Organisms */}
        <Route
          path="/antibioticmasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<AntibioticMastersListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/antibioticmasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<AntibioticMastersListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organismisolations"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<OrganismIsolatedListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/organismisolations"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<OrganismIsolatedListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/organismsisolations"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<OrganismIsolatedListScreen />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Registration */}
        <Route
          path="/lisregistration"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneLisRegistrationRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lisregistration/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneLisRegistrationRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/lisregistration/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneLisRegistrationRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Telemetry & Results Feed */}
        <Route
          path="/lisinterface"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneLisInterfaceRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/lisinterface"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneLisInterfaceRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Diagnostic Result Amendment Workstation */}
        <Route
          path="/resultamendment/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultAmendmentRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/resultamendment/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneResultAmendmentRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Masters: External Providers */}
        <Route
          path="/externalprovider"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneExternalProvidersRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/externalprovider"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneExternalProvidersRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: External Lab Orders */}
        <Route
          path="/externallaborders"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneExternalLabOrdersRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/externallaborders"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneExternalLabOrdersRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: My Orders Processing Workbench */}
        <Route
          path="/orderProcess/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneMyOrderProcessRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/orderProcess/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneMyOrderProcessRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Order Status Change Management */}
        <Route
          path="/orderstatuschange"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderStatusChangeRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/orderstatuschange"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderStatusChangeRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orderstatuschangeform/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderStatusChangeFormRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/orderstatuschangeform/:tp"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneOrderStatusChangeFormRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Masters: External Provider Tab */}
        <Route
          path="/externalprovidertab/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneExternalProviderTabRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/externalprovidertab/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneExternalProviderTabRoute />} />
            </ProtectedRoute>
          }
        />

        {/* LIS Operations: Investigation Tracking & Follow-up */}
        <Route
          path="/investigationtrackingtab/:tp/:tab"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneInvestigationTrackingRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/investigationtrackingtab/:tp/:tab"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneInvestigationTrackingRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigationtracking"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneInvestigationTrackingRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/investigationtracking"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="lis" component={<StandaloneInvestigationTrackingRoute />} />
            </ProtectedRoute>
          }
        />

        {/* RIS Operations: Dashboard */}
        <Route
          path="/ris_dashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRisDashboardRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/ris_dashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRisDashboardRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/risdashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRisDashboardRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/risdashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRisDashboardRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/2"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRisDashboardRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/dashboard/2"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRisDashboardRoute />} />
            </ProtectedRoute>
          }
        />

        {/* RIS Operations: Radiology Reports Workstation */}
        <Route
          path="/radiologyreports"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRadiologyReportsRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/radiologyreports"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRadiologyReportsRoute />} />
            </ProtectedRoute>
          }
        />

        {/* RIS Operations: Radiology Critical Findings & STAT Values */}
        <Route
          path="/radiologycriticals"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRadiologyCriticalsRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/radiologycriticals"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRadiologyCriticalsRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/radiologycriticalvalues"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRadiologyCriticalsRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/radiologycriticalvalues"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="ris" component={<StandaloneRadiologyCriticalsRoute />} />
            </ProtectedRoute>
          }
        />

        {/* Inventory / Pharmacy: Vendor Payments */}
        <Route
          path="/vendorpaymentlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inventory" component={<StandaloneVendorPaymentListRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendorpaymentlist/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inventory" component={<StandaloneVendorPaymentListRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/vendorpaymentlist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inventory" component={<StandaloneVendorPaymentListRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/vendorpaymentlist/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inventory" component={<StandaloneVendorPaymentListRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendorpayments"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inventory" component={<StandaloneVendorPaymentFormRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendorpayments/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inventory" component={<StandaloneVendorPaymentFormRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/vendorpayments"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inventory" component={<StandaloneVendorPaymentFormRoute />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/vendorpayments/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inventory" component={<StandaloneVendorPaymentFormRoute />} />
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
          path="/facilitys"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<FacilitiesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/facilitys"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<FacilitiesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/facility/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<div><FacilityTabScreen /><FacilityFormScreen /></div>} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/facility/:id/general"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<div><FacilityTabScreen /><FacilityFormScreen /></div>} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/depts"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<DepartmentsListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/depts"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<DepartmentsListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/dept"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<DepartmentFormScreen />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<RolesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/roles"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<RolesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/encdocupdate"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inpatient" component={<EncounterUpdateListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/encdocupdate"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="inpatient" component={<EncounterUpdateListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referencevaluegroups"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ReferenceValueGroupsListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/referencevaluegroups"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<ReferenceValueGroupsListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sequencemasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<SequenceMastersListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/sequencemasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<SequenceMastersListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventtemplates"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EventTemplatesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/eventtemplates"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EventTemplatesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventtemplate"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EventTemplateFormScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/eventtemplate"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EventTemplateFormScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventtemplate/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EventTemplateFormScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/eventtemplate/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EventTemplateFormScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctorpaymentmodify"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<DoctorPaymentModifyScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctorpaymentmodify/"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<DoctorPaymentModifyScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/doctorpaymentmodify"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<DoctorPaymentModifyScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/doctorpaymentmodify/"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<DoctorPaymentModifyScreen />} />
            </ProtectedRoute>
          }
        />
        {/* Pending Consultation Bills */}
        <Route
          path="/appointmentbillpendinglist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<AppointmentBillPendingListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/appointmentbillpendinglist"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="billing" component={<AppointmentBillPendingListScreen />} />
            </ProtectedRoute>
          }
        />
        {/* Admin Appointment Dashboard */}
        <Route
          path="/adminappointmentdashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="appointments" component={<AdminAppointmentDashboardScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/adminappointmentdashboard"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="appointments" component={<AdminAppointmentDashboardScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/role/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<RoleTabScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/role/:id/:tab"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<RoleTabScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/role"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<RoleTabScreen />} />
            </ProtectedRoute>
          }
        />

        {/* Groups */}
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<GroupsListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/groups"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<GroupsListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/group/:id"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<GroupTabScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/group/:id/:tab"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<GroupTabScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/group"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="dashboard" component={<GroupTabScreen />} />
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
          path="/feedbackmasters"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<FeedbackMasterListScreen />} />
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
          element={<Navigate to="/#/app/servicecategories" replace />}
        />

        <Route
          path="/serviceratecategories"
          element={<Navigate to="/#/app/serviceratecategories" replace />}
        />

        <Route
          path="/guarantors"
          element={<Navigate to="/#/app/guarantors" replace />}
        />

        <Route
          path="/serviceitems"
          element={<Navigate to="/#/app/serviceitems" replace />}
        />

        <Route
          path="/packages"
          element={<Navigate to="/#/app/packages" replace />}
        />

        <Route
          path="/surgeryorder"
          element={<Navigate to="/#/app/surgeryorder" replace />}
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
          path="/app/emr/edit-vital/:panelId/:formId"
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
          path="/app/editemrvital/:id"
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

        {/* EMR Print Master Configuration Screen */}
        <Route
          path="/emr/print-config"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrPrintMasterScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emrprintconfig"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<EmrPrintMasterScreen />} />
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

        {/* Note Templates Routes */}
        <Route
          path="/notetemplates"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<NoteTemplatesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/notetemplates"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<NoteTemplatesListScreen />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emr/notetemplates"
          element={
            <ProtectedRoute>
              <ShellWrapper activeTab="emr" component={<NoteTemplatesListScreen />} />
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
